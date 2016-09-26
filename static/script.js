(function(){

    var Router = Backbone.Router.extend({
        routes: {
            'main': 'main',
            'post': 'post'
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
        }
    });


    var MainView = Backbone.View.extend({
        render: function(){
            var mainPage = $('#linkPage').html();
            this.$el.html(mainPage);
        },
        initialize: function(){
            this.render();
        }
    });

    var PostModel = Backbone.Model.extend({
        url: 'post'
    });

    var PostView = Backbone.View.extend({
        initialize: function(){
            this.render();
        },
        render: function(){
            var postForm = $('#postForm').html();
            this.$el.html(postForm);
        }
    });

    var router = new Router();
    Backbone.history.start();
})();
