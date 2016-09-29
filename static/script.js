(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var Router = Backbone.Router.extend({
        routes: {
            '': 'main',
            'main': 'main',
            'post': 'post',
            'comments/:id': 'comments',
            'loggedinMain': 'loggedinMain'
        },
        main: function(){
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
        },
        post: function(){
            var postModel = new PostModel();
            var postView = new PostView({
                el: '#main',
                model: postModel
            });
            var logoutView = new LogoutView({
                el: '#logOutAndReturnSlot'
            });
        },
        comments: function(id) {
            var commentsModel = new CommentsModel({
                id: id
            });
            var commentsView = new CommentsView({
                el: '#main',
                model: commentsModel
            });
        },
        loggedinMain: function() {
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
            this.render();
        },
        events: {
            'click #loginButton': function(event) {
                this.model.set({
                    email: $('#email').val(),
                    password: $('#password').val()
                }).save().then(function(res) {
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
            }            }
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
            var renderedLinks = Handlebars.templates.links(linksFromDB);
            $('#linkContainer').html(renderedLinks);
        },
        initialize: function(){
            $('#main').empty();
            $('#loginSlot').empty();
            $('#postButtonContainer').empty();
            this.render();
            var view = this;
            this.model.on('change', function () {
               view.render();
           });
        },
        events: {
            'click #newLinkButton': function(event) {
                window.location.hash = 'post';
            }
        }
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
            'click #postButton': function(event) {
                this.model.set({
                    title: $("input[name|='headline']").val(),
                    link: $("input[name|='link']").val()
                }).save().then(function(res) {
                    console.log('submitted');
                    window.location.hash = 'loggedinMain';
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
                id: this.id
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
        render: function(){
            var comments = $('#commentView').html();
            this.$el.html(comments);

            var commentsFromDB = this.model.get('data');
            console.log(commentsFromDB);
            var renderedComments = Handlebars.templates.comments(commentsFromDB);
            $('#commentsContainer').html(renderedComments);

        },
        initialize: function() {
            $('#main').empty();
            this.render();
            var view = this;
            this.model.on('change', function () {
                view.render();
           });
        },
        events: {
            'click #commentButton': function(event) {
                var view = this;
                this.model.set({
                    comment: $("input[name|='commentInput']").val(),
                }).save().then(function(res) {
                    console.log('post saved');
                    view.render();
                });
            }
        }
    });
//......................................................................................
    var LogoutView = Backbone.View.extend({
        render: function() {
            var logout = $('#logoutAndReturnContainer').html();
            console.log(logout);
            this.$el.html(logout);

        },
        initialize: function() {
            this.render();
        }
    });

    var router = new Router();
    Backbone.history.start();
})();
