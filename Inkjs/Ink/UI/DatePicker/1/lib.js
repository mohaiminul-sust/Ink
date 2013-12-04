/**
 * @module Ink.UI.DatePicker_1
 * @author inkdev AT sapo.pt
 * @version 1
 */
Ink.createModule('Ink.UI.DatePicker', '1', ['Ink.UI.Common_1','Ink.Dom.Event_1','Ink.Dom.Css_1','Ink.Dom.Element_1','Ink.Dom.Selector_1','Ink.Util.Array_1','Ink.Util.Date_1', 'Ink.Dom.Browser_1'], function(Common, Event, Css, InkElement, Selector, InkArray, InkDate ) {
    'use strict';

    /* jshint maxcomplexity: 4 */

    // Repeat a string. Long version of (new Array(n)).join(str);
    function strRepeat(n, str) {
        var ret = '';
        for (var i = 0; i < n; i++) {
            ret += str;
        }
        return ret;
    }

    function dateishFromYMD(year, month, day) {
        return {_year: year, _month: month, _day: day};
    }

    function dateishFromDate(date) {
        return {_year: date.getFullYear(), _month: date.getMonth(), _day: date.getDate()};
    }

    /**
     * @class Ink.UI.DatePicker
     * @constructor
     * @version 1
     *
     * @param {String|DOMElement} selector
     * @param {Object} [options] Options
     *      @param {Boolean}   [options.autoOpen=false]  set to `true` to automatically open the datepicker.
     *      @param {String}    [options.cleanText]       text to display on clean button. defaults to 'Limpar'
     *      @param {String}    [options.closeText]       text to display on close button. defaults to 'Fechar'
     *      @param {String}    [options.cssClass]        CSS class to be applied to the datepicker
     *      @param {String}    [options.dateRange]       enforce limits to year, month and day for the Date, ex: '1990-08-25:2020-11'
     *      @param {Boolean}   [options.displayInSelect] whether to display the component in a select. defaults to false.
     *      @param {String|DOMElement} [options.dayField]   (if using options.displayInSelect) `<select>` field with days.
     *      @param {String|DOMElement} [options.monthField] (if using options.displayInSelect)  `<select>` field with months.
     *      @param {String|DOMElement} [options.yearField]  (if using options.displayInSelect)  `<select>` field with years.
     *      @param {String}    [options.format]          Date format string
     *      @param {String}    [options.instance]        unique id for the datepicker
     *      @param {Object}    [options.month]           Hash of month names. Defaults to portuguese month names. January is 1.
     *      @param {String}    [options.nextLinkText]    text to display on the previous button. defaults to '«'
     *      @param {String}    [options.ofText]          text to display between month and year. defaults to ' de '
     *      @param {Boolean}   [options.onFocus=true]    if the datepicker should open when the target element is focused
     *      @param {Function}  [options.onMonthSelected] callback function to execute when the month is selected
     *      @param {Function}  [options.onSetDate]       callback to execute when set date
     *      @param {Function}  [options.onYearSelected]  callback function to execute when the year is selected
     *      @param {String}    [options.position]        position the datepicker. Accept right or bottom, default is right
     *      @param {String}    [options.prevLinkText]    text to display on the previous button. defaults to '«'
     *      @param {Boolean}   [options.showClean]       whether to display the clean button or not. defaults to true.
     *      @param {Boolean}   [options.showClose]       whether to display the close button or not. defaults to true.
     *      @param {Boolean}   [options.shy=true]        whether the datepicker starts automatically.
     *      @param {String}    [options.startDate]       Date to define init month. Must be in yyyy-mm-dd format
     *      @param {Number}    [options.startWeekDay]    day to use as first column on the calendar view. Defaults to Monday (1)
     *      @param {Function}  [options.validYearFn]    callback function to execute when 'rendering' the month (in the month view)
     *      @param {Function}  [options.validMonthFn]    callback function to execute when 'rendering' the month (in the month view)
     *      @param {Function}  [options.validDayFn]      callback function to execute when 'rendering' the day (in the month view)
     *      @param {Function}  [options.nextValidDateFn] Find the next valid date, given the current Date. Necessary when the calendar has a lot of "holes", and not many dates are valid and they are separated by many months or years so it doesn't make sense to have the user click the "next" button too many times and not see any valid date.
     *      @param {Function}  [options.prevValidDateFn] See nextValidDateFn. Find the previous valid date.
     *      @param {Object}    [options.wDay]            Hash of weekdays. Defaults to portuguese month names. Sunday is 0.
     *      @param {String}    [options.yearRange]       enforce limits to year for the Date, ex: '1990:2020' (deprecated)
     *
     * @example
     *     <input type="text" id="dPicker" />
     *     <script>
     *         Ink.requireModules(['Ink.Dom.Selector_1','Ink.UI.DatePicker_1'],function( Selector, DatePicker ){
     *             var datePickerElement = Ink.s('#dPicker');
     *             var datePickerObj = new DatePicker( datePickerElement );
     *         });
     *     </script>
     */
    var DatePicker = function(selector, options) {
        this._dataField = selector &&
            Common.elOrSelector(selector, '[Ink.UI.DatePicker_1]: selector argument');

        this._options = Common.options('Ink.UI.DatePicker_1', {
            autoOpen:        ['Boolean', false],
            cleanText:       ['String', 'Clear'],
            closeText:       ['String', 'Close'],
            containerElement:['Element', null],
            cssClass:        ['String', 'ink-datepicker'],
            dateRange:       ['String', null],
            
            // use this in a <select>
            displayInSelect: ['Boolean', false],
            dayField:        ['Element', null],
            monthField:      ['Element', null],
            yearField:       ['Element', null],

            format:          ['String', 'yyyy-mm-dd'],
            instance:        ['String', 'scdp_' + Math.round(99999 * Math.random())],
            nextLinkText:    ['String', '»'],
            ofText:          ['String', '&nbsp;de&nbsp;'],
            onFocus:         ['Boolean', true],
            onMonthSelected: ['Function', null],
            onSetDate:       ['Function', null],
            onYearSelected:  ['Function', null],
            position:        ['String', 'right'],
            prevLinkText:    ['String', '«'],
            showClean:       ['Boolean', true],
            showClose:       ['Boolean', true],
            shy:             ['Boolean', true],
            startDate:       ['String', null], // format yyyy-mm-dd,
            startWeekDay:    ['Number', 1],

            // Validation
            validDayFn:      ['Function', null],
            validMonthFn:    ['Function', null],
            validYearFn:     ['Function', null],
            nextValidDateFn: ['Function', null],
            prevValidDateFn: ['Function', null],
            yearRange:       ['String', null],

            // Text
            month: ['Object', {
                 1:'January',
                 2:'February',
                 3:'March',
                 4:'April',
                 5:'May',
                 6:'June',
                 7:'July',
                 8:'August',
                 9:'September',
                10:'October',
                11:'November',
                12:'December'
            }],
            wDay: ['Object', {
                0:'Sunday',
                1:'Monday',
                2:'Tuesday',
                3:'Wednesday',
                4:'Thursday',
                5:'Friday',
                6:'Saturday'
            }]
        }, options || {}, this._dataField);

        this._options.format = this._dateParsers[ this._options.format ] || this._options.format;

        this._hoverPicker = false;

        this._picker = this._options.pickerField &&
            Common.elOrSelector(this._options.pickerField, 'pickerField');

        this._setMinMax( this._options.dateRange || this._options.yearRange );

        if(this._options.startDate) {
            this.setDate( this._options.startDate );
        } else if (this._dataField && this._dataField.value) {
            this.setDate( this._dataField.value );
        } else {
            var today = new Date();
            this._day   = today.getDate( );
            this._month = today.getMonth( );
            this._year  = today.getFullYear( );
        }

        if(this._options.displayInSelect &&
                !(this._options.dayField && this._options.monthField && this._options.yearField)){
            throw new Error(
                'Ink.UI.DatePicker: displayInSelect option enabled.'+
                'Please specify dayField, monthField and yearField selectors.');
        }

        this._init();
    };

    DatePicker.prototype = {
        version: '0.1',

        /**
         * Initialization function. Called by the constructor and
         * receives the same parameters.
         *
         * @method _init
         * @private
         */
        _init: function(){
            Ink.extendObj(this._options,this._lang || {});

            this._render();
            this._listenToContainerObjectEvents();

            Common.registerInstance(this, this._containerObject, 'datePicker');
        },

        /**
         * Renders the DatePicker's markup
         *
         * @method _render
         * @private
         */
        _render: function() {
            this._containerObject = document.createElement('div');

            this._containerObject.id = this._options.instance;

            this._containerObject.className = this._options.cssClass;

            this._renderSuperTopBar();

            var calendarTop = document.createElement("div");
            calendarTop.className = 'ink-calendar-top';

            this._monthDescContainer = document.createElement("div");
            this._monthDescContainer.className = 'ink-calendar-month_desc';

            this._monthPrev = document.createElement('div');
            this._monthPrev.className = 'ink-calendar-prev';
            this._monthPrev.innerHTML ='<a href="#prev" class="change_month_prev">' + this._options.prevLinkText + '</a>';

            this._monthNext = document.createElement('div');
            this._monthNext.className = 'ink-calendar-next';
            this._monthNext.innerHTML ='<a href="#next" class="change_month_next">' + this._options.nextLinkText + '</a>';

            calendarTop.appendChild(this._monthPrev);
            calendarTop.appendChild(this._monthDescContainer);
            calendarTop.appendChild(this._monthNext);

            this._monthContainer = document.createElement("div");
            this._monthContainer.className = 'ink-calendar-month';

            this._containerObject.appendChild(calendarTop);
            this._containerObject.appendChild(this._monthContainer);

            this._monthSelector = this._renderMonthSelector();
            this._containerObject.appendChild(this._monthSelector);

            this._yearSelector = document.createElement('ul');
            this._yearSelector.className = 'ink-calendar-year-selector';

            this._containerObject.appendChild(this._yearSelector);

            if(!this._options.onFocus || this._options.displayInSelect){
                if(!this._options.pickerField){
                    this._picker = document.createElement('a');
                    this._picker.href = '#open_cal';
                    this._picker.innerHTML = 'open';
                    this._picker.style.position = 'absolute';
                    this._picker.style.top = InkElement.elementTop(this._dataField);
                    this._picker.style.left = InkElement.elementLeft(this._dataField) + (InkElement.elementWidth(this._dataField) || 0) + 5 + 'px';
                    this._dataField.parentNode.appendChild(this._picker);
                    this._picker.className = 'ink-datepicker-picker-field';
                } else {
                    this._picker = Common.elOrSelector(this._options.pickerField, 'pickerField');
                }
            }

            this._appendDatePickerToDom();

            this._renderMonth();

            this._monthChanger = document.createElement('a');
            this._monthChanger.href = '#monthchanger';
            this._monthChanger.className = 'ink-calendar-link-month';
            this._monthChanger.innerHTML = this._options.month[this._month + 1];

            this._deText = document.createElement('span');
            this._deText.innerHTML = this._options._deText;

            this._yearChanger = document.createElement('a');
            this._yearChanger.href = '#yearchanger';
            this._yearChanger.className = 'ink-calendar-link-year';
            this._yearChanger.innerHTML = this._year;
            this._monthDescContainer.innerHTML = '';
            this._monthDescContainer.appendChild(this._monthChanger);
            this._monthDescContainer.appendChild(this._deText);
            this._monthDescContainer.appendChild(this._yearChanger);

            if (!this._options.inline) {
                this._addOpenCloseEvents();
            } else {
                this._openInline();
            }
            this._addDateChangeHandlersToInputs();
        },

        _addDateChangeHandlersToInputs: function () {
            var fields = this._dataField;
            if (this._options.displayInSelect) {
                fields = [
                    this._options.dayField,
                    this._options.monthField,
                    this._options.yearField];
            }
            Event.observeMulti(fields ,'change', Ink.bindEvent(function(){
                this._updateDate( );
                this._showDefaultView( );
                this.setDate( );
                if ( !this._inline && !this._hoverPicker ) {
                    this._hide(true);
                }
            },this));
        },

        _addOpenCloseEvents: function () {
            var opener = this._picker || this._dataField;

            Event.observe(opener, 'click', Ink.bindEvent(function(e){
                Event.stop(e);
                this._containerObject = InkElement.clonePosition(this._containerObject, opener);
                var top;
                var left;

                var rect = opener.getBoundingClientRect();
                if ( this._options.position === 'bottom' ) {
                    top = rect.bottom;
                    left = rect.left;
                } else {
                    top = rect.top;
                    left = rect.right;
                }
                top += InkElement.scrollHeight();
                left += InkElement.scrollWidth();

                this._containerObject.style.top = top + 'px';
                this._containerObject.style.left = left + 'px';
                this._updateDate();
                this._renderMonth();
                this._containerObject.style.display = 'block';
            },this));

            if (this._options.autoOpen) {
                this._containerObject = InkElement.clonePosition(this._containerObject, opener);
                this._updateDate();
                this._renderMonth();
                this._containerObject.style.display = 'block';
            }

            if(!this._options.displayInSelect){
                Event.observe(this._dataField, 'blur', Ink.bindEvent(function() {
                    if ( !this._hoverPicker ) {
                        this._hide(true);
                    }
                },this));
            }

            if (this._options.shy) {
                // Close the picker when clicking elsewhere.
                Event.observe(document,'click',Ink.bindEvent(function(e){
                    var target = Event.element(e);

                    // "elsewhere" is where it isn't any of these elements
                    var cannotBe = [
                        this._options.dayField,
                        this._options.monthField,
                        this._options.yearField,
                        this._picker,
                        this._dataField
                    ];

                    for (var i = 0, len = cannotBe.length; i < len; i++) {
                        if (cannotBe[i] && InkElement.descendantOf(cannotBe[i])) {
                            return;
                        }
                    }

                    this._hide(true);
                },this));
            }
        },

        _openInline: function () {
            this._updateDate();
            this._renderMonth();
            this._containerObject.style.display = 'block';
        },

        /**
         * Create the markup of the view with months.
         *
         * @method _renderMonthSelector
         * @private
         */
        _renderMonthSelector: function () {
            var selector = document.createElement('ul');
            selector.className = 'ink-calendar-month-selector';

            var ulSelector = document.createElement('ul');
            for(var mon=1; mon<=12; mon++){
                ulSelector.appendChild(this._renderMonthButton(mon));

                if (mon % 4 === 0) {
                    selector.appendChild(ulSelector);
                    ulSelector = document.createElement('ul');
                }
            }
            return selector;
        },

        /**
         * Render a single month button.
         */
        _renderMonthButton: function (mon) {
            var liMonth = document.createElement('li');
            var aMonth = document.createElement('a');
            aMonth.setAttribute('data-cal-month', mon);
            aMonth.innerHTML = this._options.month[mon].substring(0,3);
            liMonth.appendChild(aMonth);
            return liMonth;
        },

        _appendDatePickerToDom: function () {
            var appendTarget = document.body;
            if(this._options.containerElement) {
                appendTarget =
                    Ink.i(this._options.containerElement) ||  // small backwards compatibility thing
                    Common.elOrSelector(this._options.containerElement);
            } else if (this._options.inline) {
                InkElement.insertAfter(this._containerObject, this._dataField);
                return;
            }
            appendTarget.appendChild(this._containerObject);
        },

        /**
         * Render the topmost bar with the "close" and "clear" buttons.
         */
        _renderSuperTopBar: function () {
            if((!this._options.showClose) || (!this._options.showClean)){ return; }

            this._superTopBar = document.createElement("div");
            this._superTopBar.className = 'ink-calendar-top-options';
            if(this._options.showClean){
                this._superTopBar.appendChild(InkElement.create('a', {
                    className: 'clean',
                    setHTML: this._options.cleanText
                }));
            }
            if(this._options.showClose){
                this._superTopBar.appendChild(InkElement.create('a', {
                    className: 'close',
                    setHTML: this._options.closeText
                }));
            }
            this._containerObject.appendChild(this._superTopBar);
        },

        _listenToContainerObjectEvents: function () {
            Event.observe(this._containerObject,'mouseover',Ink.bindEvent(function(e){
                Event.stop( e );
                this._hoverPicker = true;
            },this));

            Event.observe(this._containerObject,'mouseout',Ink.bindEvent(function(e){
                Event.stop( e );
                this._hoverPicker = false;
            },this));

            Event.observe(this._containerObject,'click',Ink.bindEvent(this._onClick, this));
        },

        _onClick: function(e){
            var elem = Event.element(e);

            Event.stop(e);

            // Relative changers
            this._onRelativeChangerClick(elem);

            // Absolute changers
            this._onAbsoluteChangerClick(elem);

            // Mode changers
            if (Css.hasClassName(elem, 'ink-calendar-link-month')) {
                this._showMonthSelector();
            } else if (Css.hasClassName(elem, 'ink-calendar-link-year')) {
                this._showYearSelector();
            } else if(Css.hasClassName(elem, 'clean')){
                this._clean();
            } else if(Css.hasClassName(elem, 'close')){
                this._hide(false);
            }

            this._updateDescription();
        },

        /**
         * Handle click events on a changer (« ») for next/prev year/month
         * @method _onChangerClick
         * @private
         **/
        _onRelativeChangerClick: function (elem) {
            var changeYear = {
                change_year_next: 1,
                change_year_prev: -1
            };
            var changeMonth = {
                change_month_next: 1,
                change_month_prev: -1
            };

            if( elem.className in changeMonth ) {
                this._updateCal(changeMonth[elem.className]);
            } else if( elem.className in changeYear ) {
                this._showYearSelector(changeYear[elem.className]);
            }
        },

        /**
         * Handle click events on an atom-changer (day button, month button, year button)
         *
         * @method _onAbsoluteChangerClick
         * @private
         */
        _onAbsoluteChangerClick: function (elem) {
            var elemData = InkElement.data(elem);
            if (Css.hasClassName(elem, 'ink-calendar-off')) {
                return null;
            }

            if( Number(elemData.calDay) ){
                this.setDate( [this._year, this._month + 1, elemData.calDay].join('-') );
                this._hide();
            } else if( Number(elemData.calMonth) ) {
                this._month = Number(elemData.calMonth) - 1;
                this._showDefaultView();
                this._updateCal();
            } else if( Number(elemData.calYear) ){
                this._changeYear(Number(elemData.calYear));
            }
        },

        _changeYear: function (year) {
            year = +year;
            if(year){
                this._year = year;
                if( typeof this._options.onYearSelected === 'function' ){
                    this._options.onYearSelected(this, {
                        'year': this._year
                    });
                }
                this._showMonthSelector();
            }
        },

        _clean: function () {
            if(this._options.displayInSelect){
                this._options.yearField.selectedIndex = 0;
                this._options.monthField.selectedIndex = 0;
                this._options.dayField.selectedIndex = 0;
            } else {
                this._dataField.value = '';
            }
        },

        /**
         * Hides the DatePicker. If the component is shy (options.shy), behaves differently.
         *
         * @method _hide
         * @param [blur=true] Set to false to indicate this is not just a blur and force hiding even if the component is shy.
         */
        _hide: function(blur) {
            if (this._options.inline) {
                console.log('hiding an inline thing');
            }
            blur = blur === undefined ? true : blur;
            if (blur === false || (blur && this._options.shy)) {
                this._containerObject.style.display = 'none';
            }
        },

        /**
         * Sets the range of dates allowed to be selected in the Date Picker
         *
         * @method _setMinMax
         * @param {String} dateRange Two dates separated by a ':'. Example: 2013-01-01:2013-12-12
         * @private
         */
        _setMinMax: function( dateRange ) {
            var self = this;
            function noMinLimit() {
                self._yearMin   = Number.MIN_VALUE;
                self._monthMin  = 1;
                self._dayMin    = 1;
            }
            function noMaxLimit() {
                self._yearMax   = Number.MAX_VALUE;
                self._monthMax  = 12;
                self._dayMax    = 31;
            }
            function noLimits() { noMinLimit(); noMaxLimit(); }

            if (!dateRange) { return noLimits(); }

            var dates = dateRange.split( ':' );
            var rDate = /^(\d{4})((\-)(\d{1,2})((\-)(\d{1,2}))?)?$/;

            InkArray.each([
                        {suf: 'Min', date: dates[0], noLim: noMinLimit},
                        {suf: 'Max', date: dates[1], noLim: noMaxLimit}
                    ], Ink.bind(function (data) {
                var yearLim;
                var monthLim;
                var dayLim;

                if ( data.date.toUpperCase() === 'NOW' ) {
                    var now = new Date();
                    yearLim   = now.getFullYear();
                    monthLim  = now.getMonth() + 1;
                    dayLim    = now.getDate();
                } else if ( rDate.test( data.date ) ) {
                    var splitDate = data.date.split( '-' );

                    yearLim   = Math.floor( splitDate[ 0 ] );
                    monthLim  = Math.floor( splitDate[ 1 ] ) || 1;
                    dayLim    = Math.floor( splitDate[ 2 ] ) || 1;

                    if ( monthLim < 1 || monthLim > 12 ) {
                        monthLim = 1;
                    }

                    if ( dayLim < 1 || dayLim > this._daysInMonth( yearLim , monthLim - 1 ) ) {
                        dayLim = 1;
                    }
                } else {
                    data.noLim();
                    return;
                }

                this['_year' + data.suf] = yearLim;
                this['_month' + data.suf] = monthLim;
                this['_day' + data.suf] = dayLim;
            }, this));

            var valid = this._dateCmp(this._getMax(), this._getMin()) === 1;

            if (!valid) {
                noLimits();
            }
        },

        /**
         * Checks if a date is between the valid range.
         * Starts by checking if the date passed is valid. If not, will fallback to the 'today' date.
         * Then checks if the all params are inside of the date range specified. If not, it will fallback to the nearest valid date (either Min or Max).
         *
         * @method _fitDateToRange
         * @param  {Number} year  Year with 4 digits (yyyy)
         * @param  {Number} month Month
         * @param  {Number} day   Day
         * @return {Array}       Array with the final processed date.
         * @private
         */
        _fitDateToRange: function( date ) {
            if ( !this._isValidDate( date ) ) {
                date = dateishFromDate(new Date());
            }

            if (this._dateCmp(date, this._getMin()) === -1) {
                return Ink.extendObj({}, this._getMin());
            } else if (this._dateCmp(date, this._getMax()) === 1) {
                return Ink.extendObj({}, this._getMax());
            }

            return Ink.extendObj({}, date);  // date is okay already, just copy it.
        },

        /**
         * Checks whether a date is within the valid date range
         * @method _dateWithinRange
         * @param year
         * @param month
         * @param day
         * @return {Boolean}
         * @private
         */
        _dateWithinRange: function (date) {
            if (!arguments.length) {
                date = this;
            }

            return  (!this._dateAboveMax(date) &&
                    (!this._dateBelowMin(date)));
        },

        _dateAboveMax: function (date) {
            return this._dateCmp(date, this._getMax()) === 1;
        },

        _dateBelowMin: function (date) {
            return this._dateCmp(date, this._getMin()) === -1;
        },

        /**
         * Get maximum date allowed, in a {_year, _month, _day} format
         */
        _getMax: function () {
            return {
                _year: this._yearMax,
                _month: this._monthMax - 1,
                _day: this._dayMax
            };
        },

        /**
         * Get minimum date allowed, in a {_year, _month, _day} format.
         */
        _getMin: function () {
            return {
                _year: this._yearMin,
                _month: this._monthMin - 1,
                _day: this._dayMin
            };
        },

        _dateCmp: function (self, oth) {
            return this._dateCmpUntil(self, oth, '_day');
        },

        /**
         * _dateCmp with varied precision. You can compare down to the day field, or, just to the month.
         * // the following two dates are considered equal because we asked
         * // _dateCmpUntil to just check up to the years.
         *
         * _dateCmpUntil({_year: 2000, _month: 10}, {_year: 2000, _month: 11}, '_year') === 0
         */
        _dateCmpUntil: function (self, oth, shallowness) {
            var props = ['_year', '_month', '_day'];
            var i = -1;

            do {
                i++;
                if      (self[props[i]] > oth[props[i]]) { return 1; }
                else if (self[props[i]] < oth[props[i]]) { return -1; }
            } while (props[i] !== shallowness && 
                    self[props[i + 1]] !== undefined && oth[props[i + 1]] !== undefined);

            return 0;
        },

        /**
         * Sets the markup in the default view mode (showing the days).
         * Also disables the previous and next buttons in case they don't meet the range requirements.
         *
         * @method _showDefaultView
         * @private
         */
        _showDefaultView: function(){
            this._yearSelector.style.display = 'none';
            this._monthSelector.style.display = 'none';
            this._monthPrev.childNodes[0].className = 'change_month_prev';
            this._monthNext.childNodes[0].className = 'change_month_next';

            if ( !this._getPrevMonth() ) {
                this._monthPrev.childNodes[0].className = 'action_inactive';
            }

            if ( !this._getNextMonth() ) {
                this._monthNext.childNodes[0].className = 'action_inactive';
            }

            this._monthContainer.style.display = 'block';
        },

        /**
         * Updates the date shown on the datepicker
         *
         * @method _updateDate
         * @private
         */
        _updateDate: function(){
            var dataParsed;
            if(!this._options.displayInSelect && this._dataField.value){
                dataParsed = this._parseDate(this._dataField.value);
            } else if (this._options.displayInSelect) {
                dataParsed = {
                    _year: this._options.yearField[this._options.yearField.selectedIndex].value,
                    _month: this._options.monthField[this._options.monthField.selectedIndex].value - 1,
                    _day: this._options.dayField[this._options.dayField.selectedIndex].value
                };
            }

            if (dataParsed) {
                dataParsed = this._fitDateToRange(dataParsed);
                this._year = dataParsed._year;
                this._month = dataParsed._month;
                this._day = dataParsed._day;
            }
            this.setDate();
            this._updateDescription();
            this._renderMonth();
        },

        /**
         * Updates the date description shown at the top of the datepicker
         *
         * EG "12 de November"
         *
         * @method  _updateDescription
         * @private
         */
        _updateDescription: function(){
            this._monthChanger.innerHTML = this._options.month[ this._month + 1 ];
            this._deText.innerHTML = this._options.ofText;
            this._yearChanger.innerHTML = this._year;
        },

        /**
         * Renders the year selector view of the datepicker
         *
         * @method _showYearSelector
         * @private
         */
        _showYearSelector: function(inc){
            this._incrementViewingYear(inc);

            var firstYear = this._year - (this._year % 10);
            var thisYear = firstYear - 1;
            var str = "<li><ul>";

            if (thisYear > this._yearMin) {
                str += '<li><a href="#year_prev" class="change_year_prev">' + this._options.prevLinkText + '</a></li>';
            } else {
                str += '<li>&nbsp;</li>';
            }

            for (var i=1; i < 11; i++){
                if (i % 4 === 0){
                    str+='</ul><ul>';
                }

                thisYear = firstYear + i - 1;

                str += this._getYearButtonHtml(thisYear);
            }

            if( thisYear < this._yearMax ){
                str += '<li><a href="#year_next" class="change_year_next">' + this._options.nextLinkText + '</a></li>';
            } else {
                str += '<li>&nbsp;</li>';
            }

            str += "</ul></li>";

            this._yearSelector.innerHTML = str;
            this._monthPrev.childNodes[0].className = 'action_inactive';
            this._monthNext.childNodes[0].className = 'action_inactive';
            this._monthSelector.style.display = 'none';
            this._monthContainer.style.display = 'none';
            this._yearSelector.style.display = 'block';
        },

        /**
         * For the year selector.
         *
         * Update this._year, to find the next decade or use nextValidDateFn to find it.
         */
        _incrementViewingYear: function (inc) {
            if (!inc) { return; }

            var year = +this._year + inc*10;
            year = year - year % 10;
            if ( year > this._yearMax || year + 9 < this._yearMin ){
                return;
            }
            this._year = +this._year + inc*10;
        },

        _getYearButtonHtml: function (thisYear) {
            if ( this._acceptableYear({_year: thisYear}) ){
                var className = (thisYear === this._year) ? ' class="ink-calendar-on"' : '';
                return '<li><a href="#" data-cal-year="' + thisYear + '"' + className + '>' + thisYear +'</a></li>';
            } else {
                return '<li><a href="#" class="ink-calendar-off">' + thisYear +'</a></li>';

            }
        },

        /**
         * Show the month selector (happens when you click a year, or the "month" link.
         * @method _showMonthSelector
         * @private
         */
        _showMonthSelector: function () {
            this._yearSelector.style.display = 'none';
            this._monthContainer.style.display = 'none';
            this._monthPrev.childNodes[0].className = 'action_inactive';
            this._monthNext.childNodes[0].className = 'action_inactive';
            this._addMonthClassNames();
            this._monthSelector.style.display = 'block';
        },

        /**
         * This function returns the given date in the dateish format
         *
         * @method _parseDate
         * @param {String} dateStr A date on a string.
         * @private
         */
        _parseDate: function(dateStr){
            var date = InkDate.set( this._options.format , dateStr );
            if (date) {
                return dateishFromDate(date);
            }
            return null;
        },

        /**
         * Checks if a date is valid
         *
         * @method _isValidDate
         * @param {Number} year
         * @param {Number} month
         * @param {Number} day
         * @private
         * @return {Boolean} True if the date is valid, false otherwise
         */
        _isValidDate: function(date){
            var yearRegExp = /^\d{4}$/;
            var validOneOrTwo = /^\d{1,2}$/;
            return (
                yearRegExp.test(date._year)     &&
                validOneOrTwo.test(date._month) &&
                validOneOrTwo.test(date._day)   &&
                +date._month + 1 >= 1  &&
                +date._month + 1 <= 12 &&
                +date._day       >= 1  &&
                +date._day       <= this._daysInMonth(date._year,date._month - 1)
            );
        },

        /**
         * Checks if a given date is an valid format.
         *
         * @method _isDate
         * @param {String} format A date format.
         * @param {String} dateStr A date on a string.
         * @private
         * @return {Boolean} True if the given date is valid according to the given format
         */
        _isDate: function(format, dateStr){
            try {
                if (typeof format === 'undefined'){
                    return false;
                }
                var date = InkDate.set( format , dateStr );
                if( date && this._isValidDate( dateishFromDate(date) )) {
                    return true;
                }
            } catch (ex) {}

            return false;
        },

        _acceptableDay: function (date) {
            return this._acceptableDateComponent(date, 'validDayFn');
        },

        _acceptableMonth: function (date) {
            return this._acceptableDateComponent(date, 'validMonthFn');
        },

        _acceptableYear: function (date) {
            return this._acceptableDateComponent(date, 'validYearFn');
        },

        /** DRY base for the above 2 functions */
        _acceptableDateComponent: function (date, userCb) {
            if (this._options[userCb]) {
                return this._callUserCallbackBool(this._options[userCb], date);
            } else {
                return this._dateWithinRange(date);
            }
        },

        /**
         * This method returns the date written with the format specified on the options
         *
         * @method _writeDateInFormat
         * @private
         * @return {String} Returns the current date of the object in the specified format
         */
        _writeDateInFormat:function(){
            return InkDate.get( this._options.format , this.getDate());
        },

        /**
         * This method allows the user to set the DatePicker's date on run-time.
         *
         * @method setDate
         * @param {String} dateString A date string in yyyy-mm-dd format.
         * @public
         */
        setDate: function( dateString ) {
            if ( /\d{4}-\d{1,2}-\d{1,2}/.test( dateString ) ) {
                var auxDate = dateString.split( '-' );
                this._year  = +auxDate[ 0 ];
                this._month = +auxDate[ 1 ] - 1;
                this._day   = +auxDate[ 2 ];
            }

            this._setDate( );
        },

        /**
         * Get the current date as a JavaScript date.
         *
         * @method getDate
         */
        getDate: function () {
            if (!this._day) {
                throw 'Ink.UI.DatePicker: Still picking a date. Cannot getDate now!';
            }
            return new Date(this._year, this._month, this._day);
        },

        /**
         * Sets the chosen date on the target input field
         *
         * @method _setDate
         * @param {DOMElement} objClicked Clicked object inside the DatePicker's calendar.
         * @private
         */
        _setDate : function( objClicked ) {
            if (objClicked) {
                var data = InkElement.data(objClicked);
                this._day = (+data.calDay) || this._day;
            }

            var dt = this._fitDateToRange(this);

            this._year = dt._year;
            this._month = dt._month;
            this._day = dt._day;

            if(!this._options.displayInSelect){
                this._dataField.value = this._writeDateInFormat();
            } else {
                this._options.dayField.value   = this._day;
                this._options.monthField.value = this._month;
                this._options.yearField.value  = this._year;
            }

            if(this._options.onSetDate) {
                this._options.onSetDate( this , { date : this.getDate() } );
            }
        },

        /**
         * Makes the necessary work to update the calendar
         * when choosing a different month
         *
         * @method _updateCal
         * @param {Number} inc Indicates previous or next month
         * @private
         */
        _updateCal: function(inc){
            if( typeof this._options.onMonthSelected === 'function' ){
                this._options.onMonthSelected(this, {
                    'year': this._year,
                    'month' : this._month
                });
            }
            if (inc && this._updateMonth(inc) === null) {
                return;
            }
            this._renderMonth();
        },

        /**
         * Function that returns the number of days on a given month on a given year
         *
         * @method _daysInMonth
         * @param {Number} _y - year
         * @param {Number} _m - month
         * @private
         * @return {Number} The number of days on a given month on a given year
         */
        _daysInMonth: function(_y,_m){
            _m += 1;

            var exceptions = {
                2: ((_y % 400 === 0) || (_y % 4 === 0 && _y % 100 !== 0)) ? 29 : 28,
                4: 30,
                6: 30,
                9: 30,
                11: 30
            };

            return exceptions[_m] || 31;
        },


        /**
         * Updates the calendar when a different month is chosen
         *
         * @method _updateMonth
         * @param {Number} incValue - indicates previous or next month
         * @private
         */
        _updateMonth: function(incValue){
            var date;
            if (incValue > 0) {
                date = this._getNextMonth();
            } else if (incValue < 0) {
                date = this._getPrevMonth();
            }
            if (!date) { return null; }
            this._year = date._year;
            this._month = date._month;
            this._day = date._day;
        },

        /**
         * Get the next month we can show.
         */
        _getNextMonth: function (date) {
            return this._tryLeap( date, 'Month', 'next', function (d) {
                    d._month += 1;
                    if (d._month > 11) {
                        d._month = 0;
                        d._year += 1;
                    }
                    return d;
                });
        },

        /**
         * Get the previous month we can show.
         */
        _getPrevMonth: function (date) {
            return this._tryLeap( date, 'Month', 'prev', function (d) {
                    d._month -= 1;
                    if (d._month < 0) {
                        d._month = 11;
                        d._year -= 1;
                    }
                    return d;
                });
        },

        /**
         * Get the next year we can show.
         */
        _getPrevYear: function (date) {
            return this._tryLeap( date, 'Year', 'prev', function (d) {
                    d._year -= 1;
                    return d;
                });
        },

        /**
         * Get the next year we can show.
         */
        _getNextYear: function (date) {
            return this._tryLeap( date, 'Year', 'next', function (d) {
                    d._year += 1;
                    return d;
                });
        },

        /**
         * DRY base for a function which tries to get the next or previous valid year or month.
         *
         * It checks if we can go forward by using _dateCmp with atomic
         * precision (this means, {_year} for leaping years, and
         * {_year, month} for leaping months), then it tries to get the
         * result from the user-supplied callback (nextDateFn or prevDateFn),
         * and when this is not present, advance the date forward using the
         * `advancer` callback.
         */
        _tryLeap: function (date, atomName, directionName, advancer) {
            date = date || { _year: this._year, _month: this._month, _day: this._day };

            var maxOrMin = directionName === 'prev' ? 'Min' : 'Max';

            var boundary = this['_get' + maxOrMin]();  // _getMin() or _getMax()
            var compName = '_' + atomName.toLowerCase();  // _year or _month

            // Check if we're by the boundary of min/max year/month
            if (this._dateCmpUntil(date, boundary, compName) === 0) {
                return null;  // We're already at the boundary. Bail.
            }

            var leapUserCb = this._options[directionName + 'ValidDateFn'];
            if (leapUserCb) {
                return this._callUserCallbackDate(leapUserCb, date);
            } else {
                date = advancer(date);
            }

            date = this._fitDateToRange(date);

            return this['_acceptable' + atomName](date) ? date : null;
        },

        _getNextDecade: function (date) {
            date = date || { _year: this._year, _month: this._month, _day: this._day };
            var decade = this._getCurrentDecade(date);
            if (decade + 10 > this._yearMax) { return null; }
            return decade + 10;
        },

        _getPrevDecade: function (date) {
            date = date || { _year: this._year, _month: this._month, _day: this._day };
            var decade = this._getCurrentDecade(date);
            if (decade - 10 < this._yearMin) { return null; }
            return decade - 10;
        },

        /** Returns the decade given a date or year*/
        _getCurrentDecade: function (year) {
            year = year ? (year._year || year) : this._year;
            return Math.floor(year / 10) * 10;  // Round to first place
        },

        _callUserCallbackBase: function (cb, date) {
            return cb.call(this, date._year, date._month + 1, date._day);
        },

        _callUserCallbackBool: function (cb, date) {
            return !!this._callUserCallbackBase(cb, date);
        },

        _callUserCallbackDate: function (cb, date) {
            var ret = this._callUserCallbackBase(cb, date);
            return ret ? dateishFromDate(ret) : null;
        },

        /**
         * Key-value object that (for a given key) points to the correct parsing format for the DatePicker
         * @property _dateParsers
         * @type {Object}
         * @readOnly
         */
        _dateParsers: {
            'yyyy-mm-dd' : 'Y-m-d' ,
            'yyyy/mm/dd' : 'Y/m/d' ,
            'yy-mm-dd'   : 'y-m-d' ,
            'yy/mm/dd'   : 'y/m/d' ,
            'dd-mm-yyyy' : 'd-m-Y' ,
            'dd/mm/yyyy' : 'd/m/Y' ,
            'dd-mm-yy'   : 'd-m-y' ,
            'dd/mm/yy'   : 'd/m/y' ,
            'mm/dd/yyyy' : 'm/d/Y' ,
            'mm-dd-yyyy' : 'm-d-Y'
        },

        /**
         * Renders the current month
         *
         * @method _renderMonth
         * @private
         */
        _renderMonth: function(){
            var month = this._month;
            var year = this._year;
            
            // Week day of the first day in the month
            var wDayFirst = (new Date( year , month , 1 )).getDay();

            var startWeekDay = this._options.startWeekDay || 0;

            this._showDefaultView();

            if(startWeekDay > wDayFirst) {
                wDayFirst = 7 + startWeekDay - wDayFirst;
            } else {
                wDayFirst += startWeekDay;
            }

            var html = '';

            html += this._getMonthCalendarHeaderHtml(startWeekDay);

            var counter = 0;
            html+='<ul>';

            var emptyHtml = '<li class="ink-calendar-empty">&nbsp;</li>';

            // Add padding if the first day of the month is not monday.
            if(wDayFirst !== 0) {
                var empties = wDayFirst - startWeekDay - 1;
                counter += empties;
                html += strRepeat(empties, emptyHtml);
            }

            html += this._getDayButtonsHtml(counter, year, month);

            html += '</ul>';

            this._monthContainer.innerHTML = html;
        },

        _getDayButtonsHtml: function (counter, year, month) {
            var daysInMonth = this._daysInMonth(year, month);
            var ret = '';
            for (var day = 1; day <= daysInMonth; day++) {
                if (counter === 7){ // new week
                    counter=0;
                    ret += '<ul>';
                }

                ret += this._getDayButtonHtml(year, month, day);

                counter++;
                if(counter === 7){
                    ret += '</ul>';
                }
            }
            return ret;
        },

        /**
         * Get the HTML markup for a single day in month view, given year, month, day.
         *
         * @method _getDayButtonHtml
         * @private
         */
        _getDayButtonHtml: function (year, month, day) {
            var attrs = ' ';
            var date = dateishFromYMD(year, month, day);
            if (!this._acceptableDay(date)) {
                attrs += 'class="ink-calendar-off"';
            } else {
                attrs += 'data-cal-day="' + day + '"';
            }

            if (this._day && this._dateCmp(date, this) === 0) {
                attrs += 'class="ink-calendar-on" data-cal-day="' + day + '"';
            }

            return '<li><a href="#" ' + attrs + '>' + day + '</a></li>';   
        },

        /** Write the top bar of the calendar (M T W T F S S) */
        _getMonthCalendarHeaderHtml: function (startWeekDay) {
            var ret = '<ul class="ink-calendar-header">';
            var wDay;
            for(var i=0; i<7; i++){
                wDay = (startWeekDay + i) % 7;
                ret += '<li>' +
                    this._options.wDay[wDay].substring(0,1) +
                    '</li>';
            }
            return ret + '</ul>';
        },

        /**
         * This method adds class names to month buttons, to visually distinguish.
         *
         * @method _addMonthClassNames
         * @param {DOMElement} parent DOMElement where all the months are.
         * @private
         */
        _addMonthClassNames: function(parent){
            InkArray.forEach(
                (parent || this._monthSelector).getElementsByTagName('a'),
                Ink.bindMethod(this, '_addMonthButtonClassNames'));
        },

        /**
         * Add the ink-calendar-on className if the given button is the current month,
         * otherwise add the ink-calendar-off className if the given button refers to
         * an unacceptable month (given dateRange and validMonthFn)
         */
        _addMonthButtonClassNames: function (btn) {
            var data = InkElement.data(btn);
            if (!data.calMonth) { throw 'not a calendar month button!'; }

            var month = +data.calMonth - 1;

            if ( month === this._month ) {
                Css.addClassName( btn, 'ink-calendar-on' );  // This month
                Css.removeClassName( btn, 'ink-calendar-off' );
            } else {
                Css.removeClassName( btn, 'ink-calendar-on' );  // Not this month

                var toDisable = !this._acceptableMonth({_year: this._year, _month: month});
                Css.addRemoveClassName( btn, 'ink-calendar-off', toDisable);
            }
        },

        /**
         * Prototype's method to allow the 'i18n files' to change all objects' language at once.
         * @param  {Object} options Object with the texts' configuration.
         *     @param {String} closeText Text of the close anchor
         *     @param {String} cleanText Text of the clean text anchor
         *     @param {String} prevLinkText "Previous" link's text
         *     @param {String} nextLinkText "Next" link's text
         *     @param {String} ofText The text "of", present in 'May of 2013'
         *     @param {Object} month An object with keys from 1 to 12 that have the full months' names
         *     @param {Object} wDay An object with keys from 0 to 6 that have the full weekdays' names
         * @public
         */
        lang: function( options ){
            this._lang = options;
        },

        /**
         * This calls the rendering of the selected month.
         *
         * @method showMonth
         * @public
         */
        showMonth: function(){
            this._renderMonth();
        },

        /**
         * Returns true if the calendar sceen is in 'select day' mode
         * 
         * @return {Boolean} True if the calendar sceen is in 'select day' mode
         * @public
         */
        isMonthRendered: function(){
            var header = Selector.select('.ink-calendar-header', this._containerObject)[0];

            return ((Css.getStyle(header.parentNode,'display') !== 'none') &&
                    (Css.getStyle(header.parentNode.parentNode,'display') !== 'none') );
        }
    };

    return DatePicker;
});
