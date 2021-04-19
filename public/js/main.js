let homeHtml = "/snippets/home-snippet.html",
    collectionsHtml = "/snippets/coll-snippet.html",
    collectionsTitleHtml = "/snippets/coll-title-snippet.html",
    singleCollectionHtml = "/snippets/single-coll-snippet.html",
    singleCollectionTitleHtml = "/snippets/single-coll-title-snippet.html",
    singleItemHtml = "/snippets/single-item-snippet.html",
    loginHtml = "/snippets/login-snippet.html",
    reviewHtml = "/snippets/review-snippet.html",
    singleReviewHtml = "/snippets/single-review-snippet.html",
    searchHtml = "/snippets/search-snippet.html";

let content = document.getElementById('main-content');
asyncCall = (fileUrl) => fetch(fileUrl)
    .then(response => response.text());

// const asyncCall = async(page) => {
//     const response = await fetch(page);
//     const resHtml = await response.text();
//     return resHtml;
// }

let home = asyncCall(homeHtml),
    collections = asyncCall(collectionsHtml)
    collectionsTitle = asyncCall(collectionsTitleHtml),
    singleCollection = asyncCall(singleCollectionHtml),
    singleCollectionTitle = asyncCall(singleCollectionTitleHtml),
    singleTea = asyncCall(singleItemHtml),
    logIn = asyncCall(loginHtml),
    review = asyncCall(reviewHtml),
    singleReview = asyncCall(singleReviewHtml),
    search = asyncCall(searchHtml);


const routes = {
    '/home': home,
    // '/about' : about,
    '/collections': collections,
    '/collections/{{name}}': singleCollection,
    '/collections/{{name}}/{{tea_name}}': singleTea,
    '/login': logIn,
    '/search?tea={{search_tea}}&collection={{name}}': search
};

// document.addEventListener("DOMContentLoaded", function (event) {//     
//     console.log('we r here')//     
// })

const loadCollections = (dataHtml, content, title) => {
    database.ref('collections').on("value", function (snapshot) {
        title.then(titleHtml => {
            let finalHtml = titleHtml;
            finalHtml += "<article class='row'>";
            snapshot.forEach(function (data) {
                let html = dataHtml;
                let name = data.val().name;
                let img_name = data.val().img_name;
                html = insertProperty(html, 'name', name);
                html = insertProperty(html, 'img_name', img_name);
                finalHtml += html;
            });
            finalHtml += '</article>';
            content.innerHTML = finalHtml;
        });
    });
}

const loadSingleCollection = (dataHtml, content, name, title) => {
    database.ref(name).on("value", function (snapshot) {
        title.then(titleHtml => {
            let finalHtml = titleHtml;
            finalHtml = insertProperty(finalHtml, 'name', name);
            finalHtml += "<article class='row'>";
            snapshot.forEach(function (data) {
                let html = dataHtml;
                let tea_name = data.key;
                html = insertProperty(html, 'tea_name', tea_name);
                html = insertProperty(html, 'name', name);
                finalHtml += html;
            });
            finalHtml += '</article>';
            content.innerHTML = finalHtml;
        });
    });
}

const loadSingleTea = (dataHtml, content, name, tea_name) => {
    database.ref(name + '/' + tea_name).on("value", function (snapshot) {
        let finalHtml = '<article id="single-unit" class="row flex-wrap-space">';
        finalHtml += dataHtml;
        finalHtml = insertProperty(finalHtml, 'name', name);
        finalHtml = insertProperty(finalHtml, 'tea_name', snapshot.key);
        finalHtml = insertProperty(finalHtml, 'cost', snapshot.val().cost);
        finalHtml = insertProperty(finalHtml, 'brand', snapshot.val().brand);
        finalHtml = insertProperty(finalHtml, 'item_form', snapshot.val().item_form);
        finalHtml = insertProperty(finalHtml, 'origin', snapshot.val().origin);
        finalHtml = insertProperty(finalHtml, 'energy', snapshot.val().energy);
        finalHtml = insertProperty(finalHtml, 'steeping', snapshot.val().steeping);
        finalHtml = insertProperty(finalHtml, 'temperature', snapshot.val().temperature);
        finalHtml += '</article>'
        content.innerHTML = finalHtml;
        let targetElem = document.querySelector('#fact-list');
        for (let i = 0; i < snapshot.val().facts.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = snapshot.val().facts[i];
            targetElem.appendChild(li)
        }
    });
}

const loadReviewSection = (request) => {
    let targetElem = document.querySelector('#main-content');
    review.then(reviewSection => {
        reviewSection = insertProperty(reviewSection, 'name', request.collection);
        reviewSection = insertProperty(reviewSection, 'tea_name', request.tea);
        targetElem.insertAdjacentHTML('beforeend', reviewSection);
    })
}

const loadAllReviews = (name, tea_name) => {
    database.ref(name + '/' + tea_name + '/reviews').on("value", function (snapshot) {
        singleReview.then(dataHtml => { 
            let finalHtml = '';
            snapshot.forEach(function (data) {
                let html = dataHtml;
                html = insertProperty(html, 'date', data.val().date);
                html = insertProperty(html, 'rev_title', data.val().title);
                html = insertProperty(html, 'rev_content', data.val().content);
                html = insertProperty(html, 'email', data.val().email);
                html = insertProperty(html, 'displayName', data.val().username);
                html = insertProperty(html, 'key', data.key);
                finalHtml += html;
            });
            let targetElem = document.querySelector('#input-review-container');
            console.log('final:' + targetElem)
            if (targetElem && finalHtml) {
                targetElem.insertAdjacentHTML('beforeend', finalHtml);
                snapshot.forEach(function (data) {
                    let stars = document.querySelectorAll('#' + data.key + ' .review-rate span')
                    for (let i = 0; i < data.val().rating; i++) {
                        stars[i].classList.add('active');
                    }
                });
            }
        });
    });
}

const loadSearch = () => {
    database.ref()
}

const parseURL = () => {
    let url = location.hash.slice(1) || '/';
    let r = url.split("/");
    let request = {
        resource: null,
        collection: null,
        tea: null
    }
    request.resource = r[1];
    request.collection = r[2];
    request.tea = r[3];

    return request
}

const showRating = (name, tea_name) => {
    database.ref(name + '/' + tea_name + '/reviews').on("value", function (snapshot) {
        let sumRating = 0,
            markCount = snapshot.numChildren();
        snapshot.forEach(function (data) {
            sumRating += parseInt(data.val().rating);
        });
        sumRating /= markCount;
        let stars = document.querySelectorAll('.rating-result span');
        for (let i = 0; i < stars.length; i++) {
            if (sumRating >= i + 0.5) {
                stars[i].classList.add('active');
            }
            else {
                break;
            }
        }
    });
}

const getReviewRating = () => {
    let rateStars = document.getElementsByName('rating');
    let rate;
    for (let star of rateStars) {
        if (star.checked) {
            rate = star.value;
            break;
        };
    };
    return rate;
}

const writeReview = (name, tea_name) => {
    let user = firebase.auth().currentUser;
    if (user) {
        let titleReview = document.getElementById('review-title'),
            userReview = document.getElementById('review-input');
        let rate = getReviewRating();
        if ((titleReview && titleReview.value) && (userReview && userReview.value) && rate) {
            console.log('user:' + firebase.auth().currentUser.displayName)
            database.ref(name + '/' + tea_name + '/reviews').push({
                title: titleReview.value,
                content: userReview.value,
                rating: rate,
                date: new Date().toLocaleString(),
                username: user.displayName,
                email: user.email
            });
        }
        else {
            alert('Error: please, fill in all the fields.')
        }
    }
    else {
        onNavigate('#/login');
    }

}

const loadPage = () => {
    let request = parseURL()
    let parsedURL = (request.resource ? '/' + request.resource : '/') +
        (request.collection ? '/{{name}}' : '') +
        (request.tea ? '/{{tea_name}}' : '');
    console.log('parsedURL:' + parsedURL)
    if (parsedURL in routes) {
        showLoading('#main-content')
        routes[parsedURL].then(dataHtml => {
            switch (parsedURL) {
                case '/collections':
                    loadCollections(dataHtml, content, collectionsTitle);
                    break;
                case '/collections/{{name}}':
                    loadSingleCollection(dataHtml, content, request.collection, singleCollectionTitle);
                    break;
                case '/collections/{{name}}/{{tea_name}}':
                    loadSingleTea(dataHtml, content, request.collection, request.tea);
                    showRating(request.collection, request.tea);
                    loadReviewSection(request);
                    loadAllReviews(request.collection, request.tea);
                    break;
                case '/search?tea={{search_tea}}&collection={{name}}':

                    break;
                default:
                    content.innerHTML = dataHtml;
                    break;
            }
        });
    }
}

const searchTea = () => {
    let inputTea = document.getElementById('search-bar').value,
        inputCollection = document.getElementById('collection-select').value;
    let teaText = inputTea.trim().toLowerCase();
    if (teaText == "") {
        return;
    }

    if (teaText.length < 3) {
        alert("Please, use a longer string.");
        return;
    }

    database.ref(inputCollection).on("value", function (snapshot) {
        let mathes = [];
        snapshot.forEach(function (data) {
            let teaName = data.key.toLowerCase();
            if (teaName.includes(teaText) || teaText.includes(teaName)) {
                mathes.push(teaName);
            }
        });
        console.log('math:' + mathes);
    });
    console.log(inputTea, inputCollection)

}

const onNavigate = (pathname) => {
    window.history.pushState(
        {},
        pathname,
        window.location.origin + pathname
    );
    loadPage();
}

window.onpopstate = () => {
    loadPage();
}

window.onbeforeunload = () => {
    loadPage();
}

const insertHtml = (selector, html) => {
    let targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
}

const insertProperty = (string, propName, propValue) => {
    let propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
}

const showLoading = (selector) => {
    let html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html)
}

showLoading("#main-content");
onNavigate('#/home');