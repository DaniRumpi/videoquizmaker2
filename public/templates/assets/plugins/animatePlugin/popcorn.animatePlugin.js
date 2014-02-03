// PLUGIN: Media

(function ( Popcorn ) {

  var sheet = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

    // WebKit hack :(
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
  })();

  var createSheet = (function() {
    // Create the <style> tag
    var style = document.createElement("style");

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "@media only screen and (max-width : 1024px)")

    // WebKit hack :(
    style.appendChild(document.createTextNode(""));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
  });
  function addCSSRule(sheet, selector, rules, index) {
    if (!sheet) {
      sheet = createSheet();
    }
    if(sheet.insertRule) {
      sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else {
      sheet.addRule(selector, rules, index);
    }
  }
  function removeSheet() {
    if (sheet) {
      try {
        document.head.removeChild(sheet.ownerNode);
      } catch(Ex) {}
    }
  }
  function restartSheet() {
    if (sheet) {
      removeSheet();
    }
    sheet = createSheet();
  }

  function validateDimension( value, fallback ) {
    if ( typeof value === "number" || isNaN(value) === false ) {
      return value;
    }
    return fallback;
  }
  var getUniqueID = function(instance, parent) {
    return ("animate-" + instance.id+"-"+parent.id).toLowerCase();
  }
  var getUniqueParentID = function(parent) {
    return ("animate-" +parent.id).toLowerCase();
  }

  var updateBounds = function( instance, options ) {
    var id = "#"+options.idType+"."+options.classType,
        width = "width:"+validateDimension( options.width, "100" ) + "% !important",
        height = "height:"+validateDimension( options.height, "100" ) + "% !important",
        top = "top:"+validateDimension( options.top, "0" ) + "% !important",
        left = "left:"+validateDimension( options.left, "0" ) + "%!important";

    options.width   && addCSSRule(sheet, id, width);
    options.height  && addCSSRule(sheet, id, height);
    options.top     && addCSSRule(sheet, id, top);
    options.left    && addCSSRule(sheet, id, left);
    !options.width  && addCSSRule(sheet, id, "");
    !options.height && addCSSRule(sheet, id, "");
    !options.top    && addCSSRule(sheet, id, "");
    !options.left   && addCSSRule(sheet, id, "");

    if (options.rotate) {
      var rotate = validateDimension(options.rotate, "0")
      var rotateSet = [
        "transform:rotate("+rotate+"deg) !important;",
        "-ms-transform:rotate("+rotate+"deg) !important;",
        "-moz-transform:rotate("+rotate+"deg) !important;",
        "-webkit-transform:rotate("+rotate+"deg) !important;"
      ];
      addCSSRule(sheet, id, rotateSet.join(""));
    }
  }

  var updateAnimation = function( instance, options ) {
    if (options.animation && options.animation !== "nothing") {
      var id = "#"+options.idType+"."+options.classType,
          duration = validateDimension( options.duration, 1 ),
          iterationCount = validateDimension( options.iterationCount, 1 );
      if (!iterationCount || iterationCount === 0 || iterationCount === "0") {
        var iterationCount = "infinite";
      }

      var animationSet = [
        "-webkit-animation-duration: "+duration+"s;",
        "animation-duration: "+duration+"s;",
        "-webkit-animation-fill-mode: both;",
        "animation-fill-mode: both;",
        "-webkit-animation-name: "+options.animation+";",
        "animation-name: "+options.animation+";",
        "-webkit-animation-iteration-count: "+iterationCount+";",
        "animation-iteration-count: "+iterationCount+";"
      ];
      addCSSRule(sheet, id, animationSet.join(""));
    }
  }
  
  Popcorn.plugin( "animatePlugin" , {
      
    manifest: {
      about:{
        name: "Popcorn Animate Plugin",
        version: "0.1",
        author: "@robin"
      },
      defaultName: "Animate",
      options:{
        start: {
          elem: "input", 
          type: "text", 
          label: "In"
        },
        end: {
          elem: "input",
          type: "text",
          label: "Out"
        },
        width: {
          elem: "input",
          type: "number",
          label: "Width",
          "units": "%"
        },
        height: {
          elem: "input",
          type: "number",
          label: "Height",
          "units": "%"
        },
        top: {
          elem: "input",
          type: "number",
          label: "Top",
          "units": "%",
          optional: true
        },
        left: {
          elem: "input",
          type: "number",
          label: "Left",
          "units": "%",
          optional: true
        },
        rotate: {
          elem: "input",
          type: "number",
          label: "Rotate",
          "units": "deg",
          optional: true
        },
        animation: {
          elem: "select",
          values: [],
          label: "Animation",
          "default": "nothing",
          hidden: true
        },
        duration: {
          elem: "input",
          type: "number",
          label: "Duration",
          "units": "s",
          "default": 1,
          group: "advanced"
        },
        iterationCount: {
          elem: "input",
          type: "number",
          label: "Iteration Count (0 = infinite)",
          "units": "s",
          "default": 1,
          group: "advanced"
        },
        transition: {
          elem: "select",
          options: [ "None", "Pop", "Slide Up", "Slide Down", "Fade" ],
          values: [ "popcorn-none", "popcorn-pop", "popcorn-slide-up", "popcorn-slide-down", "popcorn-fade" ],
          label: "Transition",
          "default": "None",
          hidden: true
        },
        block: {
          elem: "select",
          options: ["No", "Yes"],
          label: "Block",
          "default": "No",
          hidden: true
        },
        zindex: {
          "default": 1,
          hidden: true
        },
        target: {
          hidden: true
        },
      }
    },
    /**
     * @member
     * The setup function will get all of the needed 
     * items in place before the start function is called. 
     */
    _setup : function( options ) {
      var superParent = this.animate(options);
      if (superParent) {
        options.idType = getUniqueParentID(superParent);
        options.classType = getUniqueID(options, superParent);
        restartSheet();

        if (options._running) {
          updateAnimation(superParent, options.idType);
        }
        superParent._container.id = options.idType;
        superParent._container.classList.add(options.classType);
        superParent._container.style.display = "none";
        setTimeout(function(){
          superParent._container.style.display = "block";
        }, 1);

      }
    },
    /**
     * The start function will be executed when the currentTime 
     * of the video  reaches the start time provided by the 
     * options variable
     */
    start: function( event, options ) {
      // this.function();
      var superParent = this.animate(options);
      if (superParent && !options.idType) {
        options.idType = getUniqueParentID(superParent);
        options.classType = getUniqueID(options, superParent);
      }
      if (superParent && superParent._container) {
        restartSheet();
        updateBounds(superParent, options);
        updateAnimation(superParent, options);
        superParent._container.id = options.idType;
        superParent._container.classList.add(options.classType);
      }
    },
    /**
     * The end function will be executed when the currentTime 
     * of the video  reaches the end time provided by the 
     * options variable
     */
    end: function( event, options ) {
      var superParent = this.animate(options);
      if (superParent && superParent._container) {
        superParent._container.classList.remove(options.classType);
        removeSheet();
      }
    },
    _teardown: function( options ) {
      var superParent = this.animate(options);
      if (superParent && superParent._container) {
        superParent._container.classList.remove(options.classType);
        removeSheet();
      }
    }
  });

})( Popcorn );
