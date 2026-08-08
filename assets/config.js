(function() {
    const currentHost = window.location.hostname;
    const hostIp = currentHost === '' ? '127.0.0.1' : currentHost;
    const API_PORT = '5000';
    
    window.API_BASE_URL = `http://${hostIp}:${API_PORT}`;

    console.log(" Detected Device IP / Host:", hostIp);
    console.log(" API Base URL Configured:", window.API_BASE_URL);
})();