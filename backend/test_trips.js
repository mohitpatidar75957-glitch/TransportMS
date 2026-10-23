async function test() {
    try {
        const loginRes = await fetch('https://tms--management.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@tms.com', password: 'CoderVu' })
        });
        const loginData = await loginRes.json();
        let token = loginData.token;
        if (loginData.requires2FA) {
            const otpRes = await fetch('https://tms--management.up.railway.app/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'superadmin@tms.com', otp: '123456' })
            });
            token = (await otpRes.json()).token;
        }

        const tripsRes = await fetch('https://tms--management.up.railway.app/api/v1/fleet/trips', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Trips:", tripsRes.status, await tripsRes.text());
    } catch (e) {
        console.error(e.message);
    }
}

test();
