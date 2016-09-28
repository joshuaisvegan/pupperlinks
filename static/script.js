(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};
    console.log(Handlebars.templates);

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var Router = Backbone.Router.extend({
        routes: {
            'main': 'main',
            'post': 'post',
            'comments': 'comments',
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
        },
        comments: function() {
            var commentsModel = new CommentsModel();
            var commentsView = new CommentsView({
                el: '#main',
                model: commentsModel
            });
        },
        loggedinMain: function() {
            var loggedinMainModel = new LoggedinMainModel();
            var loggedinMainView = new LoggedinMainView({

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
            console.log(login);
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

            'click #commentsButton': function (event) {
                var buttonId = $(this).atrr('id');
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

                'click #commentsButton': function (event) {
                    var buttonId = $(this).atrr('id');
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
            this.render();
        },
        events: {
            'click #postButton': function(event){
                this.model.set({
                    title: $("input[name|='headline']").val(),
                    link: $("input[name|='link']").val()
                }).save().then(function(res) {
                    console.log('submitted');
                    window.location.hash = 'main';
                });
            }
        }
    });
//    ------------------------------------------------------------------------------------
var CommentsModel = Backbone.Model.extend({
    url: '/comments'
});

var CommentsView = Backbone.View.extend({
    render: function(){
        var comments = $('#postForm').html();
        this.$el.html(comments);
    },
    initialize: function() {
        $('#main').empty();
        this.render();
    }
});


    var router = new Router();
    Backbone.history.start();
})();
