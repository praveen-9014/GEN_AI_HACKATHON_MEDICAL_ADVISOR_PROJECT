import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ username: '', email: '', password: '' });
	const [error, setError] = useState('');

	const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const res = await api.post('/auth/login', form);
			localStorage.setItem('token', res.data.token);
			if (res.data?.username) localStorage.setItem('username', res.data.username);
			if (res.data?.email) localStorage.setItem('email', res.data.email);
			navigate('/');
		} catch (err) {
			setError(err.response?.data?.message || 'Login failed');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="w-full max-w-sm bg-white shadow rounded p-6">
				<h1 className="text-xl font-semibold mb-4">Login</h1>
				<form onSubmit={handleSubmit} className="space-y-3">
					<input name="username" placeholder="Username" className="w-full border rounded px-3 py-2" onChange={handleChange} />
					<div className="relative">
						<input type="email" name="email" placeholder="Email" className="w-full border rounded px-3 py-2" onChange={handleChange} />
					</div>
					<input type="password" name="password" placeholder="Password" className="w-full border rounded px-3 py-2" onChange={handleChange} />
					{error && <p className="text-sm text-red-600">{error}</p>}
					<button className="w-full bg-blue-600 text-white py-2 rounded">Sign in</button>
				</form>
				<p className="text-sm mt-3">No account? <Link className="text-blue-600" to="/register">Register</Link></p>
			</div>
		</div>
	);
};

export default Login;
