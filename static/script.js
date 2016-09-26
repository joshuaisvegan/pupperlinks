(function(){

    var Router = Backbone.Router.extend({
        routes: {
            'main': 'main',
            'post': 'post',
            'login': 'login'
        },
        main: function(){
            var mainView = new MainView({
                el: '#main'
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
            'click #newLinkButton': function(event){
                window.location.hash = 'post';
            },
            'click #button': function(event){
                console.log('hello');
            }
        }
    });

    var PostModel = Backbone.Model.extend({
        url: 'post'
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
                window.location.hash = 'main';
            }
        }
    });

    var LoginModel = Backbone.Model.extend({
        url: 'login'
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
