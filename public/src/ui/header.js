define([ "dialog/dialog", "util/lang", "text!layouts/header.html", "ui/user-data", "ui/webmakernav/webmakernav", "ui/widget/textbox", "ui/widget/tooltip", "util/xhr" ],
  function( Dialog, Lang, HEADER_TEMPLATE, UserData, WebmakerBar, TextBoxWrapper, ToolTip, XHR ) {

  return function( butter, options ){

    options = options || {};

    var TOOLTIP_NAME = "name-error-header-tooltip";

    var _this = this,
        _userData = new UserData( butter, options ),
        _rootElement = Lang.domFragment( HEADER_TEMPLATE, ".butter-header" ),
        _webmakerNavBar = _rootElement.querySelector( "#webmaker-nav" ),
        _saveButton = _rootElement.querySelector( ".butter-save-btn" ),
        _projectTitle = _rootElement.querySelector( ".butter-project-title" ),
        _projectName = _projectTitle.querySelector( ".butter-project-name" ),
        _clearEvents = _rootElement.querySelector( ".butter-clear-events-btn" ),
        _previewBtn = _rootElement.querySelector( ".butter-preview-btn" ),
        _projectBtn = _rootElement.querySelector( ".butter-project-btn" ),
        _projectMenu = _rootElement.querySelector( ".butter-project-menu" ),
        _projectMenuControl = _rootElement.querySelector( ".butter-project-menu-control" ),
        _projectMenuList = _projectMenu.querySelector( ".butter-btn-menu" ),
        _logoBtn = _rootElement.querySelector( ".butter-logo" ),
        _quizmanagerBtn = _rootElement.querySelector( ".quizmanager-btn" ),
        //_tabzilla = _rootElement.querySelector( "#tabzilla" ),
        _noProjectNameToolTip,
        _projectTitlePlaceHolderText = _projectName.innerHTML,
        _webmakerNav,
        _toolTip,
        // create a tooltip for the plrojectName element
        _toolTip = ToolTip.create({
          title: "header-title-tooltip",
          message: "Change the name of your project",
          element: _projectTitle,
          top: "60px"
        });

    _this.element = _rootElement;

    ToolTip.apply( _projectTitle );

    // _tabzilla.addEventListener( "click", function() {
    //   document.body.classList.toggle( "tabzilla-open" );
    // }, false );

    _logoBtn.addEventListener("click", function() {
      document.location.href="/";
    });

    function getquizzesQuizDB(callback) {
      XHR.get("/api/quizzes/all", callback);
    }

    function assignQuizmeOptions(response) {
      if (response['all']) {
        for(var n in response.all) {
          Butter.QuizOptions[response.all[n].name] = JSON.parse(response.all[n].data);
        }
        window.Popcorn.manifest.quizme.options.name.options = Object.keys(Butter.QuizOptions);
      }
    }

    function saveProject() {
      if ( !butter.cornfield.authenticated() ) {
        _userData.authenticationRequired();
      }
      else if ( butter.project.isSaved ) {
        return;
      }
      else if ( checkProjectName( butter.project.name ) ) {
        _userData.authenticationRequired( prepare, nameError );
        return;
      }
      else {
        nameError();
      }
    }

    function openProjectEditor() {
      butter.editor.openEditor( "project-editor" );
    }

    function toggleProjectButton( on ) {
      if ( on ) {
        _projectBtn.classList.remove( "butter-disabled" );
        _projectBtn.addEventListener( "click", openProjectEditor, false );
      } else {
        _projectBtn.classList.add( "butter-disabled" );
        _projectBtn.removeEventListener( "click", openProjectEditor, false );
      }
    }

    function toggleSaveButton( on ) {
      if ( on ) {
        _saveButton.classList.remove( "butter-disabled" );
        _saveButton.addEventListener( "click", saveProject, false );
      } else {
        _saveButton.classList.add( "butter-disabled" );
        _saveButton.removeEventListener( "click", saveProject, false );
      }
    }

    function togglePreviewButton( on ) {
      if ( on ) {
        _previewBtn.classList.remove( "butter-disabled" );
        _previewBtn.href = butter.project.previewUrl;
        _previewBtn.onclick = function() {
          return true;
        };
      } else {
        _previewBtn.classList.add( "butter-disabled" );
        _previewBtn.href = "";
        _previewBtn.onclick = function() {
          return false;
        };
      }
    }

    function toggleClearButton( on ) {
      if ( on ) {
        _clearEvents.classList.remove( "butter-disabled" );
        _clearEvents.addEventListener( "click", clearEventsClick, false );
      } else {
        _clearEvents.classList.add( "butter-disabled" );
        _clearEvents.removeEventListener( "click", clearEventsClick, false );
      }
    }

    function toggleProjectNameListeners( state ) {
      if ( state ) {
        _projectTitle.addEventListener( "click", projectNameClick, false );
        _projectTitle.classList.remove( "no-click" );
        _projectName.addEventListener( "click", projectNameClick, false );
        _toolTip.hidden = false;
      } else {
        _projectTitle.removeEventListener( "click", projectNameClick, false );
        _projectName.removeEventListener( "click", projectNameClick, false );
        _toolTip.hidden = true;
      }
    }

    function projectNameClick() {
      var input = document.createElement( "input" );

      input.type = "text";

      input.placeholder = _projectTitlePlaceHolderText;
      input.classList.add( "butter-project-name" );
      input.value = _projectName.textContent !== _projectTitlePlaceHolderText ? _projectName.textContent : "";
      TextBoxWrapper.applyTo( input );
      _projectTitle.replaceChild( input, _projectName );
      toggleProjectNameListeners( false );
      input.focus();
      input.addEventListener( "blur", onBlur, false );
      input.addEventListener( "keypress", onKeyPress, false );
    }

    function clearEventsClick() {
      var dialog;
      if ( butter.currentMedia && butter.currentMedia.hasTrackEvents() ) {
        dialog = Dialog.spawn( "delete-track-events", {
          data: butter
        });
        dialog.open();
      }
    }

    this.views = {
      dirty: function() {
        togglePreviewButton( false );
        toggleSaveButton( true );
        toggleProjectButton( false );
      },
      clean: function() {
        togglePreviewButton( true );
        toggleSaveButton( false );
        toggleProjectButton( true );
      },
      login: function() {
        var isSaved = butter.project.isSaved;

        _projectTitle.style.display = "";
        _saveButton.innerHTML = "Save";

        togglePreviewButton( isSaved );
        toggleSaveButton( !isSaved );
        toggleProjectButton( isSaved );
        getquizzesQuizDB(assignQuizmeOptions);
      },
      logout: function() {
        togglePreviewButton( false );
        toggleSaveButton( true );
        toggleProjectButton( false );
        _projectTitle.style.display = "none";
        _saveButton.innerHTML = "Sign in to save";
        Butter.QuizOptions = [];
      },
      mediaReady: function() {
        _projectTitle.classList.remove( "butter-disabled" );
        toggleSaveButton( !butter.project.isSaved );
        toggleProjectNameListeners( true );
      },
      mediaChanging: function() {
        _projectTitle.classList.add( "butter-disabled" );
        toggleSaveButton( false );
        toggleProjectNameListeners( false );
      }
    };

    // Set up the project menu
    _projectMenuControl.addEventListener( "click", function() {
      if ( butter.currentMedia.hasTrackEvents() ) {
        toggleClearButton( true );
      } else {
        toggleClearButton( false );
      }
      _projectMenu.classList.toggle( "butter-btn-menu-expanded" );
    }, false );

    _projectMenuList.addEventListener( "click", function( e ) {
      if ( e.target.classList.contains( "butter-disabled" ) ) {
        return;
      }
      _projectMenu.classList.remove( "butter-btn-menu-expanded" );
    }, true );

    function quizmanagerCallback(e) {
      e.preventDefault();
      var dialog = Dialog.spawn( "quizme" );
      dialog.open();
    }

    function feedbackCallback() {
      var dialog = Dialog.spawn( "feedback" );
      dialog.open();
    }

    _webmakerNav = new WebmakerBar({
      container: _webmakerNavBar,
      onLogin: _userData.authenticationRequired,
      onLogout: _userData.logout,
      quizmanagerCallback: quizmanagerCallback,
      feedbackCallback: feedbackCallback
    });

    _quizmanagerBtn.addEventListener("click", quizmanagerCallback, false);


    function onLogin() {
      _webmakerNav.views.login( butter.cornfield.username() );
    }

    butter.listen( "autologinsucceeded", onLogin, false );
    butter.listen( "authenticated", onLogin, false );
    butter.listen( "logout", _webmakerNav.views.logout, false );

    function destroyToolTip() {
      if ( _noProjectNameToolTip && !_noProjectNameToolTip.destroyed ) {
        _projectTitle.removeEventListener( "mouseover", destroyToolTip, false );
        _noProjectNameToolTip.destroy();
      }
    }

    function prepare() {
      function afterSave() {
        butter.editor.openEditor( "project-editor" );
        togglePreviewButton( true );
        toggleProjectNameListeners( true );
      }

      if ( !butter.project.isSaved ) {
        toggleSaveButton( false );
        _projectTitle.classList.add( "no-click" );

        // If saving fails, restore the "Save" button so the user can try again.
        _userData.save( function() { afterSave(); },
                        function() { toggleSaveButton( true );
                                     togglePreviewButton( false );
                                     toggleProjectNameListeners( true ); } );
      } else {
        afterSave();
      }
    }

    function onKeyPress( e ) {
      var node = _projectTitle.querySelector( ".butter-project-name" );

      // if this wasn't the 'enter' key, return early
      if ( e.keyCode !== 13 ) {
        return;
      }

      node.blur();
      node.removeEventListener( "keypress", onKeyPress, false );
    }

    /*
     * Function: checkProjectName
     *
     * Checks whether the current projects name is a valid one or not.
     * @returns boolean value representing whether or not the current project name is valid
     */
    function checkProjectName( name ) {
      return !!name && name !== _projectTitlePlaceHolderText;
    }

    function nameError() {
      destroyToolTip();

      _projectTitle.addEventListener( "mouseover", destroyToolTip, false );

      ToolTip.create({
        name: TOOLTIP_NAME,
        message: "Please give your project a name before saving",
        hidden: false,
        element: _projectTitle,
        top: "50px",
        error: true
      });

      _noProjectNameToolTip = ToolTip.get( TOOLTIP_NAME );
    }

    function onBlur() {
      var node = _projectTitle.querySelector( ".butter-project-name" );
      node.removeEventListener( "blur", onBlur, false );

      _projectName.textContent = node.value || _projectTitlePlaceHolderText;
      if( checkProjectName( _projectName.textContent ) ) {
        butter.project.name = _projectName.textContent;
        _userData.authenticationRequired( prepare );
      } else {
        nameError();
        toggleProjectNameListeners( true );
      }

      _projectTitle.replaceChild( _projectName, node );
    }

    this.attachToDOM = function() {
      document.body.classList.add( "butter-header-spacing" );
      document.body.insertBefore( _rootElement, document.body.firstChild );
    };

    butter.listen( "autologinsucceeded", _this.views.login, false );
    butter.listen( "authenticated", _this.views.login, false );
    butter.listen( "logout", _this.views.logout, false );
    butter.listen( "mediaready", _this.views.mediaReady );
    butter.listen( "mediacontentchanged", _this.views.mediaChanging );

    butter.listen( "projectsaved", function() {
      // Disable "Save" button
      _this.views.clean();
      _projectName.textContent = butter.project.name;
    });

    butter.listen( "projectchanged", function() {
      // Re-enable "Save" button to indicate things are not saved
      _this.views.dirty();
    });

    butter.listen( "ready", function() {
      if ( butter.project.name ) {
        _projectName.textContent = butter.project.name;
      }
    });

  };
});
