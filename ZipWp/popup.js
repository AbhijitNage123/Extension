document.addEventListener("DOMContentLoaded", function () {
	const createNewBtn = document.getElementById("create-new-btn");
	const loginBtn = document.getElementById("login-btn");

	createNewBtn.addEventListener("click", function () {
		chrome.tabs.create({ url: "https://try.new/" });
	});

	loginBtn.addEventListener("click", function () {
		// chrome.tabs.create({ url: "https://app.zipwp.com/login" });
		// Dimensions for the new popup window
		const width = 500;
		const height = 400;

		// Calculate the center position
		const left = Math.round((screen.availWidth - width) / 2);
		const top = Math.round((screen.availHeight - height) / 2);

		// Open the new window for token input
		chrome.windows.create({
			url: 'token.html',
			type: 'popup',
			width: width,
			height: height,
			left: left,
			top: top,
		});
	});

	// Retrieve the token from localStorage
	const token = localStorage.getItem('auth_token');

	if (token) {
	// Token exists, process the data (fetch sites or show slug)
	console.log('Token received:', token);
	const myHeaders = new Headers();
	myHeaders.append("Authorization", `Bearer ${token}`);

	const requestOptions = {
		method: "GET",
		headers: myHeaders,
		redirect: "follow"
	};

	// Use the token directly in the API request
	fetch( 'https://api.zipwp.com/api/team/member/list?page=1', requestOptions )
		.then(response => {
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response.json();
		})
		.then(data => {
			console.log('User Data:', data.members[0]);
			// Display token as a slug in the top-right corner
			document.getElementById('user').src = data.members[0].avatar;
		})
		.catch(error => {
			console.error('Error fetching user data:', error);
		});

		// Use the token directly in the API request
		fetch('https://api.zipwp.com/api/sites', requestOptions)
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				console.log('User Sites Data:', data.sites[0]);
				let name = data?.sites[0]?.name;
				let uuid = data?.sites[0]?.uuid;
				// Optionally, populate other data like the site table
				const tableBody = document.getElementById('site-table').getElementsByTagName('tbody')[0];
				const row = tableBody.insertRow();
				row.insertCell(0).innerHTML = name;
				row.insertCell(1).innerHTML = '<div class="button-container"><button id="restore" disabled>Restore</button><button id="redirect-btn">Redirect</button></div>';  // Label / Site URL
				console.log(tableBody.querySelectorAll('button'));
				tableBody.querySelectorAll('button')[1].addEventListener("click", function () {
					const myHeaders = new Headers();
					myHeaders.append("Authorization", `Bearer ${token}`);
					console.log('inside redirect');
					const requestOptions = {
						method: "GET",
						headers: myHeaders,
						redirect: "follow"
					};

					// Use the token directly in the API request
					fetch(`https://api.zipwp.com/api/sites/${uuid}/auto-login`, requestOptions)
						.then(response => {
							if (!response.ok) {
								throw new Error(`HTTP error! status: ${response.status}`);
							}
							return response.json();
						})
						.then(data => {
							console.log('redirect login:', data.redirect_url);
							chrome.tabs.create({
								url: data.redirect_url
							});
							// Display token as a slug in the top-right corner
							// document.getElementById('redirect-btn').innerHTML = data.redirect_url;
						})
						.catch(error => {
							console.error('Error fetching user data:', error);
						});
				});
				// row.insertCell(1).innerHTML = '<button id="redirect-btn">Login</button>';  // Login Button
			})
			.catch(error => {
				console.error('Error fetching user sites data:', error);
			});

		
	}

});