var themeLess = (function () {
  var Input = (function () {
    function Input(el, inputHandler) {
      this.el = el;
      this.onInput = this.onInput.bind(this);
      if (inputHandler) this.onInput(inputHandler);
    }
    Input.prototype.onInput = function (handler) {
      if (this.inputHandler !== null)
        this.el.removeEventListener("input", this.inputHandler);
      var inputHandler = handler.bind(this);
      this.inputHandler = inputHandler;
      this.el.addEventListener("input", inputHandler);
    };
    Object.defineProperties(Input.prototype, {
      value: {
        get() {
          return this.el ? this.el.value : null;
        },
      },
    });
    return Input;
  })();
  var ColorPicker = (function () {
    function _ColorPicker(el, color, inputHandler) {
      Input.call(this, el, inputHandler);
      this.el = el;
      if (color) {
        this.color = color;
        this.el.value = color;
      }
    }
    _ColorPicker.prototype = Object.create(Input.prototype);
    _ColorPicker.prototype.constructor = _ColorPicker;
    Object.defineProperties(_ColorPicker.prototype, {
      lessVariable: {
        get: function () {
          return this.el ? this.el.dataset.lessVariable : null;
        },
      },
      value: {
        get: function () {
          return this.el.value || null;
        },
      },
    });
    return _ColorPicker;
  })();

  function _themeLess() {
    this.init = this.init.bind(this);
    this.colorPickerInit = this.colorPickerInit.bind(this);
    this.themeLoad = this.themeLoad.bind(this);
    this.themeSelectorInit = this.themeSelectorInit.bind(this);
    this.variablesUpdate = this.variablesUpdate.bind(this);
    this.variables = {};
    this.colorPicker = [];
    this.currentTheme = null;
    this.themeSelector = null;
  }

  _themeLess.prototype.variablesUpdate = function () {
    less.modifyVars(this.variables);
    less.refreshStyles();
  };

  _themeLess.prototype.changeVar = function (varName, newValue) {
    if (!window.less) return false;
    this.variables[varName] = newValue;
    this.variablesUpdate();
  };

  _themeLess.prototype.colorPickerInit = function (pickerSelector) {
    var theme = this;
    var ThemeColorPicker = (function () {
      function ThemeColorPicker(el, color) {
        ColorPicker.call(this, el, color, this.inputHandler);
        // theme.changeVar(this.lessVariable, this.value);
        theme.variables[this.lessVariable] = this.value;
      }
      ThemeColorPicker.prototype = Object.create(ColorPicker.prototype);
      ThemeColorPicker.prototype.constructor = ThemeColorPicker;
      ThemeColorPicker.prototype.inputHandler = function () {
        var th = theme;
        var colorPicker = this;
        th.changeVar(colorPicker.lessVariable, colorPicker.value);
      };
      return ThemeColorPicker;
    })();
    var colorPicker = Array.prototype.slice.call(
      document.querySelectorAll(pickerSelector)
    );
    colorPicker.forEach(function (el) {
      theme.colorPicker.push(new ThemeColorPicker(el));
    });
    theme.variablesUpdate();
  };

  _themeLess.prototype.themeLoad = function (themeFilePath, title) {
    var link = document.createElement("link");
    link.rel = "stylesheet/less";
    link.type = "text/css";
    link.href = themeFilePath;
    if (title) link.title = title;
    less.sheets.push(link);
    if (this.currentTheme) {
      this.themeRemove(
        this.currentTheme.title || this.getLessId(this.currentTheme.href)
      );
      for (
        var i = 0,
          a = less.sheets.length,
          c = this.currentTheme,
          s = less.sheets;
        i <= a;
        i++
      ) {
        if (c.href === s[i].href) {
          s.splice(i, 1);
          break;
        }
      }
    }
    less.refresh();
    this.currentTheme = link;
    this.variablesUpdate();
  };

  _themeLess.prototype.themeRemove = function (themeId) {
    var toRemoveElement = document.getElementById("less:" + themeId);
    if (toRemoveElement)
      toRemoveElement.parentElement.removeChild(toRemoveElement);
  };

  _themeLess.prototype.themeSelectorInit = function () {
    var theme = this;
    var ThemeSelector = (function () {
      function ThemeSelector(el) {
        Input.call(this, el);
        this.inputHandler = this.inputHandler.bind(this);
        this.onInput(this.inputHandler);
        this.inputHandler();
      }
      ThemeSelector.prototype = Object.create(Input.prototype);
      ThemeSelector.prototype.constructor = ThemeSelector;

      ThemeSelector.prototype.inputHandler = function () {
        var th = theme;
        var Selector = this;
        th.themeLoad(Selector.value + ".less");
      };
      return ThemeSelector;
    })();
    this.themeSelector = new ThemeSelector(
      document.getElementById("theme-selector")
    );
  };

  _themeLess.prototype.getLessId = function (href) {
    return href
      .replace(/^[a-z-]+:\/+?[^\/]+/, "") // Remove protocol & domain
      .replace(/[\?\&]livereload=\w+/, "") // Remove LiveReload cachebuster
      .replace(/^\//, "") // Remove root /
      .replace(/\.[a-zA-Z]+$/, "") // Remove simple extension
      .replace(/[^\.\w-]+/g, "-") // Replace illegal characters
      .replace(/\./g, ":");
  };

  _themeLess.prototype.init = function () {
    // if (window.less) less.watch();
    this.colorPickerInit(".ColorPicker-input");
    this.themeSelectorInit();
    // this.themeLoad("theme.less", "theme");
    // this.variablesUpdate();
  };

  return _themeLess;
})();

window.onload = new themeLess().init;
