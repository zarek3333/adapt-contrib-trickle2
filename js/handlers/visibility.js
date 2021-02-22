define([
  'core/js/adapt'
], function(Adapt) {

  var TrickleVisibilityHandler = Backbone.Controller.extend({

    isStepLocking: false,

    trickleModel: null,

    initialize: function() {
      this.listenToOnce(Adapt, "app:dataReady", this.onAppDataReady);
    },

    onAppDataReady: function() {
      this.setupEventListeners();
    },

    setupEventListeners: function() {
      this.listenTo(Adapt, {
        "trickle:steplock": this.onStepLock,
        "trickle:visibility": this.onVisibility,
        "trickle:hidden": this.onHidden,
        "trickle:stepunlock": this.onStepUnlock,
        "trickle:kill": this.onKill,
        "trickle:finished": this.onFinished,
        "remove": this.onRemove
      });

    },

    onStepLock: function(view) {
      this.isStepLocking = true;
      this.trickleModel = view.model;
      Adapt.trigger("trickle:visibility");
      window.setTimeout(function(){
        Adapt.trigger("trickle:hidden");
      }, 1340);
      
    },

    onVisibility: function() {
      if (!this.isStepLocking) return;

      if (!Adapt.trickle.pageView) return;

      var descendantsParentFirst = Adapt.trickle.pageView.descendantsParentFirst;

      var trickleModelId = this.trickleModel.get("_id");
      var trickleType = this.trickleModel.get("_type");

      var atIndex = _.findIndex(descendantsParentFirst, function(descendant) {
        if (descendant.get("_id") === trickleModelId) return true;
      });

      descendantsParentFirst.forEach(function(descendant, index) {
        var components = descendant.findDescendantModels("component");
        if (index <= atIndex) {
          descendant.set("_isVisible", true, {pluginName:"trickle"});
          components.forEach(function(componentModel) {
            componentModel.set("_isVisible", true, {pluginName:"trickle"});
          });
          return;
        }

        if (trickleType === "article" && descendant.get("_type") === "block") {
          // make sure article blocks are shown
          if (descendant.get("_parentId") === trickleModelId) {
            descendant.set("_isVisible", true, {pluginName:"trickle"});
            components.forEach(function(componentModel) {
              componentModel.set("_isVisible", true, {pluginName:"trickle"});
            });
            return;
          }
        }

        descendant.set("_isVisible", false, {pluginName:"trickle"});
        components.forEach(function(componentModel) {
          componentModel.set("_isVisible", false, {pluginName:"trickle"});
        });

      });

    },

    onHidden: function() {
      if (!this.isStepLocking) return;

      if (!Adapt.trickle.pageView) return;

      var descendantsParentFirst = Adapt.trickle.pageView.descendantsParentFirst;

      var trickleModelId = this.trickleModel.get("_id");
      var trickleType = this.trickleModel.get("_type");

      var atIndex = _.findIndex(descendantsParentFirst, function(descendant) {
        if (descendant.get("_id") === trickleModelId) return true;
      });

      descendantsParentFirst.forEach(function(descendant, index) {
        var blocks = descendant.findDescendantModels("block");
        if (index <= atIndex) {
          descendant.set("_isHidden", false, {pluginName:"trickle"});
          blocks.forEach(function(blockModel) {
            blockModel.set("_isHidden", false, {pluginName:"trickle"});
          });
          return;
        }

        if (trickleType === "article" && descendant.get("_type") === "block") {
          // make sure article blocks are shown
          if (descendant.get("_parentId") === trickleModelId) {
            descendant.set("_isHidden", false, {pluginName:"trickle"});
            blocks.forEach(function(blockModel) {
              blockModel.set("_isHidden", false, {pluginName:"trickle"});
            });
            return;
          }
        }

        descendant.set("_isHidden", true, {pluginName:"trickle"});
        blocks.forEach(function(blockModel) {
          blockModel.set("_isHidden", true, {pluginName:"trickle"});
        });

      });

    },

    onStepUnlock: function(view) {
      this.isStepLocking = false;
      this.trickleModel = null;
    },

    onKill: function() {
      this.onFinished();
      this.onStepUnlock();
    },

    onFinished: function() {

      var descendantsParentFirst = Adapt.trickle.pageView.descendantsParentFirst;
      descendantsParentFirst.forEach(function(descendant) {
        descendant.set("_isVisible", true, {pluginName:"trickle"});
        descendant.set("_isHidden", false, {pluginName:"trickle"});
        var components = descendant.findDescendantModels("component");
        var blocks = descendant.findDescendantModels("block");
        blocks.forEach(function(blockModel) {
            blockModel.set("_isHidden", false, {pluginName:"trickle"});
        });
        components.forEach(function(componentModel) {
          componentModel.set("_isVisible", true, {pluginName:"trickle"});
        });
      });

    },

    onRemove: function() {
      this.onStepUnlock();
    }

  });

  return new TrickleVisibilityHandler();

});
