(function(){

    var Router = Backbone.Router.extend({
        routes: {
            'main': 'main',
            'post': 'post',
            'login': 'login'
        },
        main: function(){
            var mainModel = new MainModel();
            var mainView = new MainView({
                el: '#main',
                model: mainModel
            });
        },
        post: function(){
            var postModel = new PostModel();
            var postView = new PostView({
                el: '#main',
                model: postModel
            });
        },
        login: function(){
            var loginModel = new LoginModel();
            var loginView = new LoginView({
                el: '#main',
                model: loginModel
            });
        }
    });

    var MainModel = Backbone.Model.extend({
        url: 'login',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var MainView = Backbone.View.extend({
        render: function(){
            var mainPage = $('#linkPage').html();
            this.$el.html(mainPage);
        },
        initialize: function(){
            $('#main').empty();
            this.render();
        },
        events: {
            'click #newLinkButton': function(event) {
                window.location.hash = 'post';
            },
            'click #button': function(event) {
                console.log('hello');
                this.model.set({
                    email: $('#email').val(),
                    password: $('#password').val()
                }).save().then(function(res) {
                    console.log('password matches');

                });
            }
        }
    });

    var PostModel = Backbone.Model.extend({
        url: 'post',
        save: function() {
            return $.post(this.url, this.toJSON());
        }
    });

    var PostView = Backbone.View.extend({
        render: function(){
            var postForm = $('#postForm').html();
            this.$el.html(postForm);
        },
        initialize: function(){
            $('#main').empty();
            this.render();
        },
        events: {
            'click #postButton': function(event){
                this.model.set({
                    headline: $("input[name|='headline']").val(),
                    link: $("input[name|='link']").val()
                }).save().then(function(res) {
                    console.log('submitted');
                    window.location.hash = 'main';

                });
            }
        }
    });



    var LoginView = Backbone.View.extend({
        render: function(){

        },
        initialize: function(){

        }
    });

    var router = new Router();
    Backbone.history.start();
})();
