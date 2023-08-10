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

function repoInformationHTML(repos) { //function will return array. we can use array method to him
    if (repos.length == 0) { //if user has not repos
        return `<div class="clearfix repo-list">No repos!</div>`;
    }

    var listItemsHTML = repos.map(function(repo) {
        return `<li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </li>`;
    });

//     Однако если данные были возвращены, то, поскольку это массив, мы хотим выполнить итерацию   по ним и получить эту информацию.
// Для этого мы создадим переменную с именем listItemsHTML.
// И для этого потребуются результаты метода map(), который будет выполняться для нашего массива репозиториев.
// Помните, как мы говорили ранее, что метод map() работает как forEach, но возвращает массив с результатами этой функции.

    return `<div class="clearfix repo-list">
                <p>
                    <strong>Repo List:</strong>
                </p>
                <ul>
                    ${listItemsHTML.join("\n")}
                </ul>
            </div>`;
    //код для красивого отображения. внутри ul отображаются то что возвращено в метод мап - li
    //${listItemsHTML.join("\n")} - метод мап возвращает array к которому применимы методы
}

function fetchGitHubInformation(event) {
    $("#gh-user-data").html("");
    $("#gh-repo-data").html(""); //for clearing div 

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
            $.getJSON(`https://api.github.com/users/${username}`), //получаем с api.github информацию по username
            $.getJSON(`https://api.github.com/users/${username}/repos`) //получаем с api.github информацию по username -> repos
        ).then( //после того как это обработано вызываем функцию которая в наш див выводит полученные данные с сервера - userInformationHTML(userData) и другую функцию repoInformationHTML(repoData) которая в другой див выводит repoData
            
            function(firstResponse, secondResponse) { //one for username, one for repos
                var userData = firstResponse[0];
                var repoData = secondResponse[0];
                //Теперь, когда мы делаем два подобных вызова, метод when() упаковывает ответ в массивы. И каждый из них является первым элементом массива. Так что нам просто нужно поместить туда индексы для этих ответов.
            
            $("#gh-user-data").html(userInformationHTML(userData));
            $("#gh-repo-data").html(repoInformationHTML(repoData));
            }, //в случае ошибки вызываем функцию error
            function(errorResponse) {
                if (errorResponse.status === 404) { //если ошибка в том что пользователь с таким именем которое введено не найдет (ошибка 404) 
                    $("#gh-user-data").html(
                        `<h2>No info found for user ${username}</h2>`); //то в див выводиться эта строка
                }  else if (errorResponse.status === 403) { //ошибка 403 возвращается при превышении количество запросов
                    var resetTime = new Date(errorResponse.getResponseHeader('X-RateLimit-Reset') * 1000);
                    $("#gh-user-data").html(`<h4>Too many requests, please wait until ${resetTime.toLocaleTimeString()}</h4>`);
                } else { //для других ошибок
                    console.log(errorResponse);
                    $("#gh-user-data").html(
                        `<h2>Error: ${errorResponse.responseJSON.message}</h2>`);
                }
            });
}

// The next thing I want to do is have the octocat profile displaying when the page is loaded, instead of just having an empty div.
$(document).ready(fetchGitHubInformation);


// So our main bugs are being squashed, but there is still quite a big issue left to deal with.
// The big issue is that every time we type something into our text box, we fire off a request to the API.
// And, unfortunately for us, GitHub has a limit restriction in place as to how many requests you can make in a given time period.
// This is called throttling, and it's designed to prevent users from making too many API requests and putting GitHub servers under stress.
// Таким образом, наши основные ошибки устраняются, но остается еще довольно серьезная проблема, которую необходимо решить.
// Большая проблема заключается в том, что каждый раз, когда мы что-то вводим в текстовое поле, мы запускаем запрос к API.
// И, к сожалению для нас, на GitHub действует ограничение на количество запросов, которые вы можете сделать за определенный период времени.
// Это называется регулированием и предназначено для того, чтобы пользователи не делали слишком много запросов к API и не подвергали серверы GitHub нагрузке.

//fix this bug on the lines 92-94. Ниже пояснения к этим строчкам кода

// Итак, здесь мы создадим новую переменную с именем resetTime и установим ее в качестве нового объекта даты.
// Дата, которую мы хотим получить, на самом деле хранится внутри нашего ответа об ошибках внутри заголовков.
// И конкретный заголовок, на который мы хотим ориентироваться, — это заголовок X-RateLimit-Reset.
// Это заголовок, предоставленный GitHub, чтобы сообщить нам, когда наша квота будет сброшена и когда мы снова сможем начать использовать API.
// Это представляется нам как временная метка UNIX.
// Итак, чтобы получить его в формате, который мы можем прочитать, нам нужно умножить его на 1000, а затем превратить в объект даты.
// И это даст нам действительную удобочитаемую дату в нашей переменной resetTime.
// Затем все, что нам нужно сделать, это взять эту переменную resetTime и отобразить ее нашему пользователю.
// Итак, мы будем использовать jQuery для нацеливания на наш элемент gh-user-data.
// А затем мы установим HTML-содержимое этого элемента в наше понятное сообщение об ошибке.
// Мы собираемся использовать <h4>.
// И мы скажем пользователю, что он сделал слишком много запросов, а затем дадим ему время, когда он может повторить попытку.
// Итак, мы скажем «Слишком много запросов, подождите», а затем мы можем передать переменную resetTime.
// Итак, снова используя ${resetTime}
// Мы собираемся использовать метод toLocaleTimeString() для этого объекта даты resetTime, который мы создали.
// И что это сделает, так это подберет ваше местоположение из вашего браузера и распечатает местное время.