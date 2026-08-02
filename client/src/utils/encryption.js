export const generateKey = async () => {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

export const importKey = async (base64Key) => {
  const rawKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
};

export const encryptText = async (text, base64Key) => {
  const key = await importKey(base64Key);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedText
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

export const decryptText = async (encryptedBase64, base64Key) => {
  const key = await importKey(base64Key);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decrypted);
};

export const encryptFile = async (file, base64Key) => {
  const key = await importKey(base64Key);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const arrayBuffer = await file.arrayBuffer();
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );
  
  const blob = new Blob([iv, encrypted], { type: 'application/octet-stream' });
  return new File([blob], file.name, { type: file.type });
};

export const decryptFile = async (blob, base64Key) => {
  const key = await importKey(base64Key);
  const arrayBuffer = await blob.arrayBuffer();
  
  const iv = arrayBuffer.slice(0, 12);
  const data = arrayBuffer.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new Blob([decrypted], { type: blob.type });
};
