const API_BASE = '/backend';

// ===== STORAGE UTILITIES =====

function saveUserSession(user) {
    localStorage.setItem('techmarket_user', JSON.stringify(user));
    updateAuthUI();
}

function getUserSession() {
    const user = localStorage.getItem('techmarket_user');
    return user ? JSON.parse(user) : null;
}

function clearUserSession() {
    localStorage.removeItem('techmarket_user');
    updateAuthUI();
}

function isLoggedIn() {
    return getUserSession() !== null;
}

// ===== UI UTILITIES =====

function showAlert(elementId, message, type = 'danger') {
    const alertEl = document.getElementById(elementId);
    if (alertEl) {
        alertEl.className = `alert alert-${type}`;
        alertEl.textContent = message;
        alertEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            alertEl.style.display = 'none';
        }, 5000);
    }
}

function hideAlert(elementId) {
    const alertEl = document.getElementById(elementId);
    if (alertEl) {
        alertEl.style.display = 'none';
    }
}

function updateAuthUI() {
    const user = getUserSession();
    const authButtons = document.getElementById('auth-buttons');

    if (authButtons) {
        if (user) {
            authButtons.innerHTML = `
                <span class="text-white me-3">Hola, ${user.nombre}</span>
                <button class="btn btn-outline-light btn-sm" onclick="logout()">Cerrar Sesión</button>
            `;
        } else {
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline-light btn-sm me-2">Iniciar Sesión</a>
                <a href="signup.html" class="btn btn-light btn-sm">Registrarse</a>
            `;
        }
    }
}

// ===== AUTHENTICATION FUNCTIONS =====

async function login(email, password) {
    try {
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE}/auth.php`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            saveUserSession(data.user);
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || 'Error al iniciar sesión' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
    }
}

async function register(nombre, email, password, rol) {
    try {
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('nombre', nombre);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('rol', rol);

        const response = await fetch(`${API_BASE}/auth.php`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, message: data.message };
        } else {
            return { success: false, message: data.message || 'Error al registrar' };
        }
    } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'Error de conexión. Verifica que el servidor esté activo.' };
    }
}

function logout() {
    clearUserSession();
    window.location.href = 'index.html';
}

// ===== FORM HANDLERS =====

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showAlert('alertMessage', 'Por favor completa todos los campos');
            return;
        }

        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        const result = await login(email, password);

        if (result.success) {
            showAlert('successMessage', '¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAlert('alertMessage', result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// Signup Form
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const rol = document.getElementById('rol').value;

        // Validations
        if (!nombre || !email || !password || !confirmPassword) {
            showAlert('alertMessage', 'Por favor completa todos los campos');
            return;
        }

        if (password.length < 6) {
            showAlert('alertMessage', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('alertMessage', 'Las contraseñas no coinciden');
            return;
        }

        // Disable submit button
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando cuenta...';

        const result = await register(nombre, email, password, rol);

        if (result.success) {
            showAlert('successMessage', '¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAlert('alertMessage', result.message);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

// ===== INITIALIZATION =====

// Update auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();

    // Redirect logged-in users away from login/signup pages
    const currentPage = window.location.pathname;
    if (isLoggedIn() && (currentPage.includes('login.html') || currentPage.includes('signup.html'))) {
        window.location.href = 'index.html';
    }
});
