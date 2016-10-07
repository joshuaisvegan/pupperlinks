(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });

    Handlebars.registerPartial("item", $("#commentPartial").html());

    var isLoggedIn;
    var csrf;

    var Router = Backbone.Router.extend({
        routes: {
            '': 'main',
            'main': 'main',
            'post': 'post',
            'comments/:id': 'comments',
            'loggedinMain': 'loggedinMain',
            'register': 'register'
        },
        main: function(){
            $('#main').off();
            if (isLoggedIn) {
                window.location.hash = 'loggedinMain';
            }   else {
                var mainModel = new MainModel();
                var mainView = new MainView({
                    el: '#main',
                    model: mainModel
                });
                var loginModel = new LoginModel();
                var loginView = new LoginView({
                    el: '#loginSlot',
                    model: loginModel
                });
            }
        },
        post: function(){
            $('#main').off();
            if (isLoggedIn) {
                var postModel = new PostModel();
                var postView = new PostView({
                    el: '#main',
                    model: postModel
                });
                var logoutView = new LogoutView({
                    el: '#logOutAndReturnSlot'
                });
            } else {
                window.location.hash = 'main';
            }
        },
        comments: function(id) {
            $('#main').off();

            var router = this;
            var commentsModel = new CommentsModel({
                id: id
            });
            var commentsView = new CommentsView({
                el: '#main',
                model: commentsModel
            }).on('refresh', function() {
                router.comments(id);
            });
            var logoutView = new LogoutView({
                el: '#logOutAndReturnSlot'
            });
        },
        loggedinMain: function() {
            $('#main').off();

            if (isLoggedIn) {
                var loggedinMainModel = new LoggedinMainModel();
                var loggedinMainView = new LoggedinMainView({
                    el: '#main',
                    model: loggedinMainModel
                });
                var postButtonView = new PostButtonView({
                    el: '#postButtonContainer'
                });
                var logoutView = new LogoutView({
                    el: '#logOutAndReturnSlot'
                });

            } else {
                window.location.hash = 'main';
            }
        },
        register: function () {
            $('#main').off();
            if (isLoggedIn) {
                window.location.hash = 'loggedinMain';
            }  else {
                var registerModel = new RegisterModel();
                var registerView = new RegisterView({
                    el: '#main',
                    model: registerModel
                });
            }
        }
    });

//------------------------------------------------------------------------------------
    var LoginModel = Backbone.Model.extend({
        url: '/login',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var LoginView = Backbone.View.extend({
        render: function(){
            var login = $('#loginContainer').html();
            this.$el.html(login);
        },
        initialize: function(){
            console.log(isLoggedIn);

            this.render();
        },
        events: {
            'click #loginButton': function(event) {
                this.model.set({
                    email: $('#email').val(),
                    password: $('#password').val(),
                    _csrf: csrf
                }).save().then(function(res) {
                    isLoggedIn = true;
                    console.log('password matches');
                    window.location.hash = 'loggedinMain';
                });
            }
        }
    });

    //------------------------------------------------------------------------------------

    var PostButtonView = Backbone.View.extend({
        render: function(){
            var postButton = $('#postButton').html();
            this.$el.html(postButton);
        },
        initialize: function(){
            this.render();
        },
        events: {
            'click #newLinkButton': function(event) {
                console.log('post');
                window.location.hash = 'post';
            }
        }
    });
//    ------------------------------------------------------------------------------------
    var MainModel = Backbone.Model.extend({
        url: '/links',

        initialize: function() {
            this.fetch();
        }
    });


    var MainView = Backbone.View.extend({
        render: function(){
            var mainPage = $('#linkPage').html();
            this.$el.html(mainPage);

            var linksFromDB = this.model.get('data');
            console.log(linksFromDB);
            var renderedLinks = Handlebars.templates.links(linksFromDB);
            $('#linkContainer').html(renderedLinks);
        },
        initialize: function(){
            $('#main').empty();
            $('#postButtonContainer').empty();
            var view = this;
            this.model.on('change', function () {
               view.render();
           });
        },
        events: {
            'click #commentsButton': function (event) {
                window.location.hash = 'comments';
            },
            'click .likeButton': function(event) {
                alert('you must be loggedin to like a link');
            }
        }
    });
//    ------------------------------------------------------------------------------------
    var RegisterModel = Backbone.Model.extend({
        url: '/register',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var RegisterView = Backbone.View.extend({
        render: function() {
            var register = $('#registrationFormContainer').html();
            this.$el.html(register);
        },
        initialize: function() {
            $('#main').empty();
            $('#loginSlot').empty();
            this.render();
        },
        events: {
            'click #registerButton': function(event) {
                console.log('register');
                this.model.set({
                    name: $('#registrationName').val(),
                    email: $('#registrationEmail').val(),
                    password: $('#registrationPassword').val(),
                    _csrf: csrf
                }).save().then(function(res) {
                    isLoggedIn = true;
                    console.log('loggedin');
                    window.location.hash = 'loggedinMain';
                }).catch(function(xhr) {
                    console.log(xhr.status);
                });
            }
        }
    });

//    ------------------------------------------------------------------------------------

    var LoggedinMainModel = Backbone.Model.extend({
        url: '/links',

        initialize: function() {
            this.fetch();
        }
    });


    var LoggedinMainView = Backbone.View.extend({
        render: function(){
            var mainPage = $('#linkPage').html();
            this.$el.html(mainPage);

            var linksFromDB = this.model.get('data');
            console.log(linksFromDB);
            var renderedLinks = Handlebars.templates.links(linksFromDB);
            $('#linkContainer').html(renderedLinks);
        },
        initialize: function(){
            $('#main').empty();
            $('#loginSlot').empty();
            $('#postButtonContainer').empty();
            $('#invalidUrlSlot').empty();
            console.log(isLoggedIn);

            var id =

            this.render();
            var view = this;
            this.model.on('change', function () {
               view.render();
           });
        },
        events: {
            'click #newLinkButton': function(event) {
                window.location.hash = 'post';
            },
            'click .likeButton': function(event) {
                var likeId = (event.currentTarget.id).substr(11);
                var counter = $('#likesCounter'+likeId).text();
                counter++;
                $('#likesCounter'+likeId).empty();
                $('#likesCounter'+likeId).html(counter);

                var likesModel = new LikesModel({
                    likeId: likeId,
                    _csrf: csrf
                });
                $('#likeButton'+'-'+likeId).removeClass('likeButton');
            }
        }
    });

    //......................................................................................
    var LikesModel = Backbone.Model.extend({
        url: '/likes',
        initialize: function() {
            $.post(this.url, this.toJSON());
        },
    });

//    ------------------------------------------------------------------------------------
    var PostModel = Backbone.Model.extend({
        url: '/post',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var PostView = Backbone.View.extend({
        render: function(){
            var form = $('#postForm').html();
            this.$el.html(form);
        },
        initialize: function(){
            $('#main').empty();
            $('#postButtonContainer').empty();
            this.render();
        },
        events: {
            'click #submitButton': function(event) {
                this.model.set({
                    title: $("input[name|='headline']").val(),
                    link: $("input[name|='link']").val(),
                    _csrf: csrf
                }).save().then(function(res) {

                    console.log(res);
                    console.log('submitted');
                    window.location.hash = 'loggedinMain';
                }).catch(function(xhr) {
                    console.log(xhr.status);
                    if (xhr.status === 403) {
                        var urlErrorView = new UrlErrorView({
                            el: '#invalidUrlSlot'
                        });
                    }
                });
            }
        }
    });
//    ------------------------------------------------------------------------------------
    var CommentsModel = Backbone.Model.extend({
        url: function() {
            return '/comments/'+this.id;
        },
        initialize: function() {
            this.fetch();
        },
        save: function() {
            var latestComment = {
                comment: this.changed.comment,
                id: this.id,
                _csrf: csrf
            };
            var model = this;
            console.log(latestComment);
            return $.post('/comments', latestComment).then(function(comments) {
                model.set(comments);
                console.log(comments);
            });
        }

    });

    var CommentsView = Backbone.View.extend({
        render: function() {
            var comments = $('#commentView').html();
            this.$el.html(comments);

            var commentsFromDB = this.model.get('data');
            console.log(commentsFromDB);
            var renderedComments = Handlebars.templates.comments(commentsFromDB);
            $('#commentsContainer').html(renderedComments);

        },
        initialize: function() {
            $('#main').empty();
            $('#invalidUrlSlot').empty();
            this.render();
            var view = this;
            this.model.on('change', function () {
                view.render();
           });
        },
        events: {
            'click #commentButton': function(event) {
                if (isLoggedIn) {
                    var view = this;
                    this.model.set({
                        comment: $("input[name|='commentInput']").val(),
                        _csrf: csrf
                    }).save().then(function(res) {
                        console.log('post saved');
                        view.render();
                    }).catch(function(xhr) {
                        console.log(xhr.status);
                        if (xhr.status === 403) {
                            alert('cannot post empty comment');
                        }
                    });
                } else {
                    alert('please log in or create an account to post comments');
                }
            },
            'click .replyButtons': function(event) {
                if (isLoggedIn) {
                    var linkId = this.model.id;
                    console.log(linkId);
                    var buttonId = (event.currentTarget.id).substr(12);
                    var view = this;
                    var replyModel = new ReplyModel({
                        id: buttonId,
                        linkId: linkId
                    });
                    var replyView = new ReplyView({
                        el: '#replyFormContainer-'+buttonId,
                        model: replyModel
                    }).on('replyComplete', function() {
                        view.undelegateEvents().trigger('refresh');
                        console.log('render');
                    });
                } else {
                    alert('please log in or create an account to post comments');

                }
            }
        }
    });
//......................................................................................
    var ReplyModel = Backbone.Model.extend({
        url: function() {
            return '/reply/'+this.id;
        },
        save: function() {
            console.log(this.toJSON());
            return $.post(this.url(), this.toJSON());
        }

    });

    var ReplyView = Backbone.View.extend({
        render: function() {
            var form = this.$('form');
            this.$el.html(form);
        },
        initialize: function() {
            this.render();
        },
        events: {
            'click .sendButton': function(event) {
                console.log('hello');
                var view = this;
                this.model.set({
                    reply: this.$("input[name|='reply']").val(),
                    id: this.model.id,
                    linkId: this.model.get('linkId'),
                    _csrf: csrf
                }).save().then(function(res) {
                    console.log('saved');
                    view.undelegateEvents().trigger('replyComplete');
                });
            }
        }
    });

//......................................................................................
    var LogoutView = Backbone.View.extend({
        render: function() {
            var logout = $('#logoutAndReturnContainer').html();
            this.$el.html(logout);

        },
        initialize: function() {
            this.render();
        },
        events: {
            'click #logOut': function (event) {
                console.log('logged out');
                isLoggedIn = false;
            }
        }
    });

    //......................................................................................
    var UrlErrorView = Backbone.View.extend({
        render: function() {
            var invalidUrlMessage = $('#invalidUrlMessage').html();
            this.$el.html(invalidUrlMessage);

        },
        initialize: function() {
            this.render();
        }
    });

    //......................................................................................

    $.get('/init', function(data) {
        csrf = data.csrfToken;
        if (data.username) {
            isLoggedIn = true;
        } else {
            isLoggedIn = false;
        }
        console.log(isLoggedIn);
        var router = new Router();
        Backbone.history.start();
    }).catch(function(xhr) {
        isLoggedIn = false;
    });

})();
