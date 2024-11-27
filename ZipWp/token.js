document.getElementById('submit-token').addEventListener('click', () => {
	const token = document.getElementById('auth-token').value.trim();
	const statusDiv = document.getElementById('status');

	// Store the token in localStorage or handle it as needed
	localStorage.setItem('auth_token', token);

	if (token) {
		const myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);

		const requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow"
		};
		console.log('Token submitted:', token);
		// Use the token directly in the API request
		fetch( 'https://api.zipwp.com/api/team/member/list?page=1', requestOptions )
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				console.log('User Data:', data);
				responseDiv.textContent = JSON.stringify(data, null, 2);
			})
			.catch(error => {
				console.error('Error fetching user data:', error);
				responseDiv.textContent = `Error: ${error.message}`;
			});
		

		// Close the window after 1 second (for user to see success message)
		setTimeout(() => {
			window.close();
		}, 1000);
		statusDiv.textContent = 'Token submitted successfully!';
	} else {
		statusDiv.textContent = 'Please enter a valid token.';
	}
});
