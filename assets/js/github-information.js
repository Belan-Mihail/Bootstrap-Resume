function userInformationHTML(user) {  //user is the object that's been returned from the GitHub API.
    return `
    <h2>${user.name}  
        <span class="small-name">
            (@<a href="${user.html_url}" target="_blank">${user.login}</a>)
        </span>
    </h2>
    <div class="gh-content">
        <div class="gh-avatar">
            <a href="${user.html_url}" target="_blank">
                <img src="${user.avatar_url}" width="80" height="80" alt="${user.login}" />
            </a>
        </div>
        <p>Followers: ${user.followers} - Following ${user.following} <br> Repos: ${user.public_repos}</p>
    </div>`;
    //user.name - This will return the user's public display name
    //user.html_url - This is a link to the user's public profile on GitHub.
    //gh-content - And this is where content about the user is going to appear. 
    //gh-avatar - And this div is where we're going to display the user's avata
    //user.following - And this will be a count of the number of people that our user is following.
    //${user.followers} - people who are following our user.
    //${user.public_repos) And this will give us a count of the public repositories that this user has
}

function fetchGitHubInformation(event) {
    var username = $('#gh-username').val();
    if (!username) {   //if username is empty
        $("#gh-user-data").html(`<h2>Please enter a GitHub username</h2>`); 
        //displayed on the page if username is empty
        return;
    }

    $("#gh-user-data").html(   //little animation that will just keep repeating itself while data has been accessed.
   
        `<div id="loader">
            <img src="assets/css/loader.gif" alt="loading..." />
        </div>`);


        // We can use the when() and then() methods to create promises.

        // Or in our case, when we've got a response from the GitHub API, then run a function to display it in the gh-user-data div.

        $.when(
            $.getJSON(`https://api.github.com/users/${username}`) //получаем с api.github информацию по username
        ).then( //после того как это обработано вызываем функцию которая в наш див выводит полученные данные с сервера - userInformationHTML(userData)
            function(response) {
                var userData = response;
                $("#gh-user-data").html(userInformationHTML(userData));
            }, //в случае ошибки вызываем функцию error
            function(errorResponse) {
                if (errorResponse.status === 404) { //если ошибка в том что пользователь с таким именем которое введено не найдет (ошибка 404) 
                    $("#gh-user-data").html(
                        `<h2>No info found for user ${username}</h2>`); //то в див выводиться эта строка
                } else { //для других ошибок
                    console.log(errorResponse);
                    $("#gh-user-data").html(
                        `<h2>Error: ${errorResponse.responseJSON.message}</h2>`);
                }
            });
}


