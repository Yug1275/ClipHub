import { API_URL } from './api'

const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')

export function resolveMediaUrl(resourcePath, version = '') {
	if (!resourcePath) return ''
	
	if (resourcePath.startsWith('data:')) {
		return resourcePath
	}

	let resolvedUrl
	if (resourcePath.startsWith('http://') || resourcePath.startsWith('https://')) {
		resolvedUrl = resourcePath
	} else {
		const normalizedPath = resourcePath.startsWith('/') ? resourcePath : `/${resourcePath}`
		resolvedUrl = `${API_BASE_URL}${normalizedPath}`
	}

	if (!version) return resolvedUrl

	const separator = resolvedUrl.includes('?') ? '&' : '?'
	return `${resolvedUrl}${separator}v=${encodeURIComponent(version)}`
}