export const API_EXAMPLES = {
    textClip: {
        save: {
            title: "Save Text Clip",
            method: "POST",
            endpoint: "/api/clip",
            description: "Save a text clip to the clipboard.",

            requestBody: {
                key: "global-test",
                content: "Hello World!",
                expiry: "24h",        // optional
                password: "secret123", // optional
                maxViews: 5           // optional
            },

            response: {
                success: true,
                message: "Clip saved successfully",
                key: "global-test",
                expiresIn: 86400,
                overwritten: false,
                hasPassword: true,
                maxViews: 5,
                url: "https://cliphub-ksuf.onrender.com/clip?key=global-test",
                apiUrl: "https://cliphub-ksuf.onrender.com/api/clip/global-test"
            }
        },

        get: {
            title: "Get Text Clip",
            method: "GET/POST",
            endpoint: "/api/clip/:key",
            description: "Retrieve a text clip. Use POST if the clip is password-protected",

            requestBody: {
                password: "secret123"
            },

            response: {
                success: true,
                data: {
                    content: "Hello from ClipHub!",
                    createdAt: "2026-03-27T10:30:00Z",
                    viewCount: 1,
                    expiresIn: 3540,
                    oneTime: false,
                    type: "text",
                    viewLimit: 5,
                    viewsRemaining: 4
                }
            }
        }
    },

    fileUpload: {
        upload: {
            title: "Upload File",
            method: "POST",
            endpoint: "/api/file",
            description: "Upload a file (requires authentication)",
            headers: {
                "Authorization": "Bearer your-jwt-token"
            },
            formData: {
                file: "[Select your file]",
                key: "my-document",
                expiry: "1d"
            },
            response: {
                success: true,
                message: "File uploaded successfully",
                file: {
                    key: "my-document",
                    originalName: "document.pdf",
                    size: 1024000,
                    mimetype: "application/pdf",
                    uploadedBy: "John Doe",
                    url: "http://localhost:5000/api/file/my-document"
                }
            }
        },

        download: {
            title: "Download File",
            method: "GET",
            endpoint: "/api/file/:key",
            description: "Download a file by key",
            response: "Returns binary file data with proper Content-Type and Content-Disposition headers"
        }
    },

    auth: {
        signup: {
            title: "Create Account",
            method: "POST",
            endpoint: "/api/auth/signup",
            description: "Register a new user account",
            requestBody: {
                email: "user@example.com",
                password: "secure-password",
                name: "John Doe"
            },
            response: {
                success: true,
                message: "User created successfully",
                token: "jwt-token-here",
                user: {
                    id: "user-id",
                    email: "user@example.com",
                    name: "John Doe",
                    createdAt: "2026-03-27T10:30:00Z"
                }
            }
        },

        login: {
            title: "Sign In",
            method: "POST",
            endpoint: "/api/auth/login",
            description: "Authenticate with email and password",
            requestBody: {
                email: "user@example.com",
                password: "secure-password"
            },
            response: {
                success: true,
                message: "Login successful",
                token: "jwt-token-here",
                user: {
                    id: "user-id",
                    email: "user@example.com",
                    name: "John Doe",
                    lastLogin: "2026-03-27T10:30:00Z"
                }
            }
        }
    }
};

export const SETUP_GUIDES = {
    localMode: {
        title: " Local Setup (No Database Required)",
        steps: [
            {
                title: "Clone the repository",
                description: "The local version is perfect for fast transfers on your local network. It does not require MongoDB, Redis, or User Authentication. (Note: You can completely ignore the `server` folder when running locally, as it's only for the global version).",
                code: "git clone https://github.com/Yug1275/ClipHub.git\ncd ClipHub"
            },
            {
                title: "Install Dependencies",
                description: "Install packages for both the client and local server by running this command in the root folder:",
                code: "npm run install:local"
            },
            {
                title: "Start the Local Server",
                description: "Open a new terminal and run. The local server will start on port 5001.",
                code: "cd local-server\nnpm run dev"
            },
            {
                title: "Start the Client (Website)",
                description: "Open a second terminal and run. The client will start in standalone (local) mode.",
                code: "cd ClipHub\ncd client\nnpm run dev"
            }
        ]
    }
};
