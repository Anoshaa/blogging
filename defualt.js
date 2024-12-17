// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBLoIuExl01cEIIUjhUX1tiyP5_emvdEcw",
    authDomain: "blogging-website-55af7.firebaseapp.com",
    databaseURL: "https://blogging-website-55af7-default-rtdb.firebaseio.com",
    projectId: "blogging-website-55af7",
    storageBucket: "blogging-website-55af7.firebasestorage.app",
    messagingSenderId: "286010962969",
    appId: "1:286010962969:web:c2b7f87bd2ff4733116688",
    measurementId: "G-XXXXXXX" // Replace with your actual measurement ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Realtime Database
const database = firebase.database();

// Function to upload a new post
function upload() {
    var heading = document.getElementById('blog-heading').value;
    var image = document.getElementById('image').files[0];
    var post = document.getElementById('post').value;

    if (heading.trim() === "") {
        Swal.fire('Error', 'Please provide a heading for the post.', 'error');
        return;
    }

    if (post.trim() === "") {
        Swal.fire('Error', 'Please provide content for the post.', 'error');
        return;
    }

    if (!image) {
        Swal.fire('Error', 'Please provide an image for the post.', 'error');
        return;
    }

    var postsRef = database.ref('posts');
    postsRef.orderByChild('heading').equalTo(heading).once('value', function(snapshot) {
        if (snapshot.exists()) {
            Swal.fire('Duplicate Post', 'A post with the same heading already exists!', 'warning');
        } else {
            var reader = new FileReader();
            reader.onloadend = function() {
                var imageURL = reader.result;
                var date = new Date();
                var timestamp = date.toLocaleString();

                var newPost = {
                    heading: heading,
                    text: post,
                    imageURL: imageURL,
                    timestamp: timestamp
                };

                postsRef.push(newPost).then(() => {
                    document.getElementById('post-form').reset();
                    getdata();

                    Swal.fire('Success', 'Your post has been uploaded!', 'success');
                }).catch(error => {
                    console.error("Error saving data: ", error);
                });
            };

            reader.readAsDataURL(image);
        }
    });
}

// Function to get and display blog posts
function getdata(query = "") {
    var postsRef = database.ref('posts');

    postsRef.orderByChild('timestamp').once('value', function(snapshot) {
        var posts = snapshot.val() || {};
        var posts_div = document.getElementById('posts');
        posts_div.innerHTML = "";

        Object.keys(posts).forEach(function(postId) {
            var post = posts[postId];

            if (query === "" || post.heading.toLowerCase().includes(query.toLowerCase()) || post.text.toLowerCase().includes(query.toLowerCase())) {
                posts_div.innerHTML += `
                      <div class="col-sm-12 col-md-6 col-lg-4 mt-2 mb-1">
    <div class="card">
        <img src="${post.imageURL}" style="height:250px;" class="card-img-top">
        <div class="card-body">
            <h5 class="card-title mb-3">${post.heading}</h5> <!-- Added margin-bottom for spacing -->
            <p class="card-text mb-3">${post.text}</p> <!-- Added margin-bottom for spacing -->
            <p class="text-muted mb-3">Posted on: ${post.timestamp}</p> <!-- Added margin-bottom for spacing -->
            <a href="blog.html?id=${postId}" class="btn btn-primary btn-post-readmore mb-2">Read More</a> <!-- Added margin-bottom for spacing -->
            <button class="btn btn-danger btn-post-delete mb-2" onclick="delete_post('${postId}')">Delete</button> <!-- Added margin-bottom for spacing -->
        </div>
    </div>
</div>
                `;
            }
        });
    });
}


function searchPosts(event) {
    event.preventDefault();
    
    let query = document.getElementById('search-input').value.toLowerCase().replace(/[\s-]+/g, ''); // Normalize query
    let posts = document.querySelectorAll('.card');
    
    // Get the posts container
    let posts_div = document.getElementById('posts');

    // Always align posts left when search is active
    if (query) {
        posts_div.style.display = 'block'; // Ensure the container is block-level to stack posts
        posts_div.style.textAlign = 'left'; // Align the content to the left
    } else {
        posts_div.style.textAlign = 'center'; // Center when search is cleared
    }

    posts.forEach(post => {
        let titleElement = post.querySelector('.card-title');
        let contentElement = post.querySelector('.card-text');

        // Normalize text for comparison
        let title = titleElement ? titleElement.textContent.toLowerCase().replace(/[\s-]+/g, '') : '';
        let content = contentElement ? contentElement.textContent.toLowerCase().replace(/[\s-]+/g, '') : '';

        // Remove trailing 's' for plural form comparison
        let normalizedQuery = query.endsWith('s') ? query.slice(0, -1) : query;
        let normalizedTitle = title.endsWith('s') ? title.slice(0, -1) : title;
        let normalizedContent = content.endsWith('s') ? content.slice(0, -1) : content;

        // Show or hide posts based on the search query
        if (normalizedTitle.includes(normalizedQuery) || normalizedContent.includes(normalizedQuery)) {
            post.style.display = 'block'; // Show matching post
        } else {
            post.style.display = 'none'; // Hide non-matching post
        }
    });
}










// Function to delete a post
function delete_post(postId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'confirm-btn',
            cancelButton: 'cancel-btn'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            var postRef = database.ref('posts/' + postId);
            postRef.remove()
                .then(function() {
                    getdata();

                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Your post has been deleted.',
                        icon: 'success',
                        customClass: {
                            confirmButton: 'confirm-btn'
                        }
                    });
                })
                .catch(function(error) {
                    console.error("Error deleting post: ", error);
                    Swal.fire('Error', 'There was an issue deleting your post.', 'error');
                });
        }
    });
}

// Initialize the data when the page loads
window.onload = function() {
    getdata();
};
