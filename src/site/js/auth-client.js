/**
 * auth-client.js
 *
 * Vanilla JS client that wires auth forms to Better Auth REST endpoints.
 * No build step required – loaded as a plain <script> on auth pages.
 *
 * Better Auth endpoints used:
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/forget-password
 *   POST /api/auth/reset-password/:token
 *   GET  /api/auth/get-session
 *   POST /api/auth/sign-out
 */

(function () {
  'use strict';

  // ── Helpers ───────────────────────────────────────────────────────────────

  function $(selector) {
    return document.querySelector(selector);
  }

  function showError(msg) {
    const el = $('#auth-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
  }

  function hideError() {
    const el = $('#auth-error');
    if (!el) return;
    el.textContent = '';
    el.classList.remove('is-visible');
  }

  function showSuccess(msg) {
    const el = $('#auth-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.classList.add('is-loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  }

  function setFieldsDisabled(form, disabled) {
    if (!form) return;
    const inputs = form.querySelectorAll('input');
    inputs.forEach(function (input) {
      input.disabled = disabled;
    });
  }

  async function authFetch(url, body) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    var data;
    try {
      data = await res.json();
    } catch (_) {
      data = null;
    }
    return { ok: res.ok, status: res.status, data: data };
  }

  /**
   * Extract a human-readable error message from a Better Auth error response.
   */
  function extractErrorMessage(result) {
    if (result.data && result.data.message) return result.data.message;
    if (result.status === 401) return 'Invalid email or password.';
    if (result.status === 422) return 'Please check your input and try again.';
    if (result.status === 429) return 'Too many attempts. Please try again later.';
    return 'Something went wrong. Please try again.';
  }

  // ── Login Page ────────────────────────────────────────────────────────────

  function initLogin() {
    var form = $('#login-form');
    if (!form) return;

    var submitBtn = $('#submit-btn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();
      setLoading(submitBtn, true);
      setFieldsDisabled(form, true);

      var email = form.querySelector('#email').value.trim();
      var password = form.querySelector('#password').value;

      if (!email || !password) {
        showError('Please fill in all fields.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      try {
        var result = await authFetch('/api/auth/sign-in/email', {
          email: email,
          password: password,
        });

        if (result.ok) {
          window.location.href = '/dashboard';
        } else {
          showError(extractErrorMessage(result));
          setLoading(submitBtn, false);
          setFieldsDisabled(form, false);
        }
      } catch (_) {
        showError('Network error. Please check your connection.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
      }
    });
  }

  // ── Signup Page ───────────────────────────────────────────────────────────

  function initSignup() {
    var form = $('#signup-form');
    if (!form) return;

    var submitBtn = $('#submit-btn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();
      setLoading(submitBtn, true);
      setFieldsDisabled(form, true);

      var name = form.querySelector('#name').value.trim();
      var email = form.querySelector('#email').value.trim();
      var password = form.querySelector('#password').value;
      var confirmPassword = form.querySelector('#confirm-password').value;

      if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      if (password.length < 8) {
        showError('Password must be at least 8 characters.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      try {
        var result = await authFetch('/api/auth/sign-up/email', {
          name: name,
          email: email,
          password: password,
        });

        if (result.ok) {
          window.location.href = '/dashboard';
        } else {
          showError(extractErrorMessage(result));
          setLoading(submitBtn, false);
          setFieldsDisabled(form, false);
        }
      } catch (_) {
        showError('Network error. Please check your connection.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
      }
    });
  }

  // ── Forgot Password Page ──────────────────────────────────────────────────

  function initForgotPassword() {
    var form = $('#forgot-password-form');
    if (!form) return;

    var submitBtn = $('#submit-btn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();
      setLoading(submitBtn, true);
      setFieldsDisabled(form, true);

      var email = form.querySelector('#email').value.trim();

      if (!email) {
        showError('Please enter your email address.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      try {
        var result = await authFetch('/api/auth/forget-password', {
          email: email,
          redirectTo: window.location.origin + '/reset-password',
        });

        // Always show success to prevent email enumeration
        showSuccess(
          'If an account with that email exists, a password reset link has been sent. Check the server console for the reset URL (local dev).'
        );
        setLoading(submitBtn, false);
        // Keep fields disabled after success
      } catch (_) {
        showError('Network error. Please check your connection.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
      }
    });
  }

  // ── Reset Password Page ───────────────────────────────────────────────────

  function initResetPassword() {
    var form = $('#reset-password-form');
    if (!form) return;

    var submitBtn = $('#submit-btn');
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');

    // Check for error param (expired/invalid token from Better Auth redirect)
    var errorParam = params.get('error');
    if (errorParam === 'INVALID_TOKEN') {
      showError('This reset link has expired or is invalid. Please request a new one.');
      form.style.display = 'none';
      return;
    }

    if (!token) {
      showError('No reset token found. Please request a new password reset link.');
      form.style.display = 'none';
      return;
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideError();
      setLoading(submitBtn, true);
      setFieldsDisabled(form, true);

      var password = form.querySelector('#password').value;
      var confirmPassword = form.querySelector('#confirm-password').value;

      if (!password || !confirmPassword) {
        showError('Please fill in all fields.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      if (password.length < 8) {
        showError('Password must be at least 8 characters.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
        return;
      }

      try {
        var result = await authFetch('/api/auth/reset-password/' + encodeURIComponent(token), {
          newPassword: password,
          token: token,
        });

        if (result.ok) {
          showSuccess('Password reset successfully! Redirecting to login...');
          setTimeout(function () {
            window.location.href = '/login';
          }, 2000);
        } else {
          showError(extractErrorMessage(result));
          setLoading(submitBtn, false);
          setFieldsDisabled(form, false);
        }
      } catch (_) {
        showError('Network error. Please check your connection.');
        setLoading(submitBtn, false);
        setFieldsDisabled(form, false);
      }
    });
  }

  // ── Dashboard Page ────────────────────────────────────────────────────────

  function initDashboard() {
    var content = $('#dashboard-content');
    if (!content) return;

    // Fetch session
    fetch('/api/auth/get-session', {
      method: 'GET',
      credentials: 'include',
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.user) throw new Error('No user');

        var user = data.user;
        var avatarEl = $('#user-avatar');
        var nameEl = $('#user-name');
        var emailEl = $('#user-email');

        if (avatarEl) avatarEl.textContent = (user.name || user.email || '?')[0].toUpperCase();
        if (nameEl) nameEl.textContent = user.name || 'User';
        if (emailEl) emailEl.textContent = user.email || '';

        content.style.display = '';
      })
      .catch(function () {
        // Not logged in – redirect to login
        window.location.href = '/login';
      });

    // Logout button
    var logoutBtn = $('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        setLoading(logoutBtn, true);
        try {
          await fetch('/api/auth/sign-out', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (_) {
          // ignore
        }
        window.location.href = '/login';
      });
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    initSignup();
    initForgotPassword();
    initResetPassword();
    initDashboard();
  });
})();
