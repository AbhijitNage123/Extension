document.addEventListener("DOMContentLoaded", function () {
	const infoContainer = document.querySelector('.container-info');
	const btnContainer = document.querySelector('.button-container');
	const createNewBtn = document.getElementById("create-new-btn");
	const loginBtn = document.getElementById("login-btn");

	// click event on create new button.
	createNewBtn.addEventListener("click", function () {
		chrome.tabs.create({ url: "https://try.new/" });
	});

	// Create the API Token submission container.
	const tokenContainer = document.createElement('div');

	// Retrieve the user data from localStorage.
	const token = localStorage.getItem('token');
	console.log('(localStorage) Token:', token);
	if( ! token ) {
		loginBtn.addEventListener("click", function () {
			// Add an class to the token container.
			tokenContainer.className = 'token-container';

			// Input for API Token.
			const tokenInput = document.createElement('input');
			tokenInput.type = 'text';
			tokenInput.id = 'auth-token';
			tokenInput.placeholder = 'Enter your API token';

			// Submit Button.
			const submitTokenBtn = document.createElement('button');
			submitTokenBtn.id = 'submit-token';
			submitTokenBtn.textContent = 'Submit';

			// Add a click event listener to the dynamically created button.
			submitTokenBtn.addEventListener('click', () => {
				const token = document.getElementById('auth-token')?.value.trim();
				// set token in localStorage.
				localStorage.setItem('token', JSON.stringify(token, null, 2));
				const statusDiv = document.getElementById('status');
				const responseDiv = document.getElementById('response') || document.createElement('div'); // Create a response div if not present

				if (!responseDiv.id) {
					responseDiv.id = 'response';
					document.querySelector('.token-container').appendChild(responseDiv); // Append to token container
				}

				if ( token ) {
					statusDiv.textContent = 'Submitting token...';
					statusDiv.style.color = 'blue';

					const myHeaders = new Headers();
					myHeaders.append("Authorization", `Bearer ${token}`);

					const requestOptions = {
						method: "GET",
						headers: myHeaders,
						redirect: "follow"
					};

					// Fetch the user data with plans.
					fetch('https://api.zipwp.com/api/user', requestOptions)
						.then(response => {
							if (!response.ok) {
								throw new Error(`HTTP error! Status: ${response.status}`);
							}
							return response.json();
						})
						.then(data => {
							// set user data in localStorage.
							localStorage.setItem('user_data_with_plans', JSON.stringify(data, null, 2)); // Display raw JSON data (format it as needed)
						})
						.catch(error => {
							console.error('Error fetching user data:', error);
						});

					// Fetch the user data.
					fetch('https://api.zipwp.com/api/team/member/list?page=1', requestOptions)
					.then(response => {
						if (!response.ok) {
							throw new Error(`HTTP error! Status: ${response.status}`);
						}
						return response.json();
					})
					.then(data => {
						// set user data in localStorage.
						localStorage.setItem('user_data', JSON.stringify(data, null, 2)); // Display raw JSON data (format it as needed)
						statusDiv.textContent = 'Token submitted successfully!';
						statusDiv.style.color = 'green';
						tokenContainer.style.display = 'none'; // Hide the token container.
					})
					.catch(error => {
						console.error('Error fetching user data:', error);
						statusDiv.textContent = `Error: ${error.message}`;
						statusDiv.style.color = 'black';
					});
					// Fetch the user sites data.
					fetch('https://api.zipwp.com/api/sites', requestOptions)
					.then(response => {
						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}
						return response.json();
					}).then(data => {
						// set user sites data in localStorage.
						localStorage.setItem('user_sites_data', JSON.stringify(data, null, 2));
						data?.sites?.forEach( site => {
							// Fetch the redirect url data.
							fetch(`https://api.zipwp.com/api/sites/${site.uuid}/auto-login`, requestOptions)
								.then(response => {
									if (!response.ok) {
										throw new Error(`HTTP error! status: ${response.status}`);
									}
									return response.json();
								}).then(data => {
									// set redirect url data in localStorage.
									localStorage.setItem('redirect_url', JSON.stringify(data, null, 2));
								}).catch(error => {
									console.error('Error fetching user data:', error);
								});
						} )
					}).catch(error => {
						console.error('Error fetching user sites data:', error);
					});

					// Optional: Clear input after submission
					document.getElementById('auth-token').value = '';

				} else {
					statusDiv.textContent = 'Please enter a valid token.';
					statusDiv.style.color = 'white';
				}
			});

			// Status Div
			const statusDiv = document.createElement('div');
			statusDiv.id = 'status';

			// Note Section
			const noteDiv = document.createElement('div');
			noteDiv.className = 'note';

			const noteContent = `
			<p><strong>How to create an API token:</strong></p>
			<p>1. Login to your <a href="https://app.zipwp.com/login" target="_blank">ZipWP account</a>.</p>
			<p>2. Go to <strong>My Profile</strong> > <strong>API Tokens</strong>.</p>
			<p>3. Click <strong>New API Token</strong>, enter a token name, and click on <strong>Generate</strong>.</p>
			<p>4. Copy the token and paste it in the <strong>API Token</strong> field.</p>`;
			
			noteDiv.innerHTML = noteContent;

			// Append elements to the token container
			tokenContainer.appendChild(tokenInput);
			tokenContainer.appendChild(submitTokenBtn);
			tokenContainer.appendChild(noteDiv);
			tokenContainer.appendChild(statusDiv);
			tokenContainer.style.display = 'flex'; // Show the token container
			tokenContainer.style.flexDirection = 'column';
			tokenContainer.style.gap = '10px'; // Space between elements
			// Append the Auth Token container to the main container
			infoContainer.appendChild(tokenContainer);
			btnContainer.style.display = 'none'; // Hide the login button
		} );
	}
	// Retrieve the user data from localStorage.
	const userData = localStorage?.getItem('user_data');
	console.log('(localStorage) User Data:', userData);
	// Retrieve the user data with active plans from localStorage.
	const userDataWithPlans = localStorage?.getItem('user_data_with_plans');
	console.log('(localStorage) User Data With Plans:', userDataWithPlans);
	if ( userData ) {
		// Parse the string from localStorage into a JavaScript object.
		const parsedUserData = JSON.parse(userData);
		const parsedUserDataWithPlans = JSON.parse(userDataWithPlans);
		document.getElementById('name').textContent = parsedUserData.members[0].name;
		// Create the API Token submission container.
		const planInfo = document.createElement('div');
		planInfo.className = 'plan-info';
		// Status Div
		const badgePlan = document.createElement('span');
		badgePlan.id = 'plan-type';
		badgePlan.className = 'badge';
		// Status Div
		const badgeLimit = document.createElement('span');
		badgeLimit.id = 'limit';
		badgeLimit.className = 'badge';
		// Append elements to the token container
		planInfo.appendChild(badgePlan);
		planInfo.appendChild(badgeLimit);
		infoContainer.appendChild(planInfo);
		document.getElementById('plan-type').textContent = 'Plan: ' +parsedUserDataWithPlans.user.active_plan.name;
		document.getElementById('limit').textContent = 'Limit: ' + parsedUserDataWithPlans.user.plan_data.limit.all_sites_count;
		document.getElementById('user').src = parsedUserData.members[0].avatar;
	}
	// Retrieve the user sites data from localStorage.
	const userSitesData = localStorage?.getItem('user_sites_data');
	console.log('(localStorage) User Sites Data:', userSitesData);

	if ( userSitesData ) {
		btnContainer.style.display = 'none'; // Hide the button container.

		// Reference to the data-container div
		const dataContainer = document.querySelector('.data-container');

		// Create a table element
		const table = document.createElement('table');
		table.id = 'site-table';

		// Create the table header
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');

		const headers = ['Action', 'Label'];
		headers.forEach(headerText => {
			const th = document.createElement('th');
			th.textContent = headerText;
			headerRow.appendChild(th);
		});
		thead.appendChild(headerRow);

		// Create the table body
		const tbody = document.createElement('tbody');
		
		// Parse the string from localStorage into a JavaScript object.
		const parsedUserSitesData = JSON.parse(userSitesData);
		// Populate the table rows with data
		parsedUserSitesData?.sites?.forEach(item => {
			const row = document.createElement('tr');
			// Action.
			const actionCell = document.createElement('td');
			// actionCell.textContent = parsedUserSitesData?.sites.length;
			row.appendChild(actionCell);

			// Label / Site URL
			const labelCell = document.createElement('td');
			const anchor = document.createElement('a');
			anchor.textContent = item.name;
			anchor.href = item.url;
			anchor.target = '_blank'; // Open in a new tab
			anchor.style.textDecoration = 'none'; // Optional: Style the link
			anchor.style.color = '#ffffff'; // Optional: Set link color
			const loginToSite = document.createElement('button');
			loginToSite.textContent = 'Login';
			loginToSite.id = 'login-to-site';
			loginToSite.target = '_blank'; // Open in a new tab
			loginToSite.style.textDecoration = 'none'; // Optional: Style the link
			loginToSite.addEventListener("click", function () {
				// Retrieve the redirect URL data from localStorage.
				const redirectURL = localStorage?.getItem('redirect_url');
				console.log('(localStorage) Redirect URL:', redirectURL);
				const parsedRedirectURL = JSON.parse(redirectURL);
				if ( parsedRedirectURL ) {
					chrome.tabs.create({
						url: parsedRedirectURL.redirect_url
					});
				}
			} );
			labelCell.appendChild(anchor);
			actionCell.appendChild(loginToSite);
			row.appendChild(labelCell);

			// Add the row to the table body
			tbody.appendChild(row);
		});

		// Append the header and body to the table
		table.appendChild(thead);
		table.appendChild(tbody);

		// Add the table to the data-container div
		dataContainer.appendChild(table);
	}
});