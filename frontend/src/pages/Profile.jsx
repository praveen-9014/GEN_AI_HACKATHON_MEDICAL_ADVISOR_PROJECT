import React, { useEffect, useState } from 'react';
import api from '../api';

const Profile = () => {
    const [me, setMe] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
	const [msg, setMsg] = useState('');

	useEffect(() => {
        api.get('/profile/me').then((res) => {
            setMe(res.data);
            setUsername(res.data.username);
            setEmail(res.data.email || '');
        });
	}, []);

	const handleSave = async (e) => {
		e.preventDefault();
        await api.put('/profile/me', { username, email });
		setMsg('Saved');
		setTimeout(() => setMsg(''), 1000);
	};

	if (!me) return null;

	return (
		<div className="max-w-3xl mx-auto p-4">
			<div className="bg-white rounded-2xl shadow border p-4 relative">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-xl font-semibold">Profile</h1>
					<button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="px-3 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Logout</button>
				</div>
				<form onSubmit={handleSave} className="space-y-3">
					<div>
						<label className="block text-sm font-medium">Username</label>
						<input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
					</div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" required />
                    </div>
					<div>
						<label className="block text-sm font-medium">Member since</label>
						<p className="mt-1 text-gray-700">{new Date(me.createdAt).toLocaleString()}</p>
					</div>
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
					{msg && <span className="text-green-600 text-sm ml-2">{msg}</span>}
				</form>
			</div>
		</div>
	);
};

export default Profile;
