/*jshint -W079*/

'use strict';

var Timetable = function() {
	this.scope = {
		hourStart: 9,
		hourEnd: 17
	};
	this.locations = [];
	this.events = {};
	this.events.toBeDisplayed = [];
	this.events.displayed = [];
};

Timetable.Renderer = function(tt) {
	if (!(tt instanceof Timetable)) {
		throw new Error('Initialize renderer using a Timetable');
	}
	this.timetable = tt;
	this.options = {
		defaultCycleNumber: 1,
		startDateTime: "now"
	};
	this.authorizedOptions = ["defaultCycleNumber", "startDateTime"];
	this.container = null;
};

(function() {
	function isValidHourRange(start, end) {
		return isValidHour(start) && isValidHour(end);
	}
	function isValidHour(number) {
		return isInt(number) && isInHourRange(number);
	}
	function isInt(number) {
		return number === parseInt(number, 10);
	}
	function isInHourRange(number) {
		return number >= 0 && number < 25;
	}
	function locationExistsIn(loc, locs) {
		if (loc == "all") return true;
		for (var k=0; k<locs.length; k++) {
			if (loc === locs[k].id) {
				return true;
			}
		}
		return false;
	}
	function isValidTimeRange(start, end) {
		var correctTypes = start instanceof Date && end instanceof Date;
		var correctOrder = start < end;
		return correctTypes && correctOrder;
	}
	function getDurationHours(startHour, endHour) {
		return endHour >= startHour ? endHour - startHour : 25 + endHour - startHour;
	}

	Timetable.prototype = {
		setScope: function(start, end) {
			if (isValidHourRange(start, end)) {
				this.scope.hourStart = start;
				this.scope.hourEnd = end;
			} else {
				throw new RangeError('Timetable scope should consist of (start, end) in whole hours from 0 to 24');
			}

			return this;
		},
		addLocations: function(newLocations) {
			function hasProperFormat() {
				return newLocations instanceof Array && typeof newLocations[0] === 'string';
			}

			function hasExtendFormat() {
				return newLocations instanceof Array && newLocations[0] instanceof Object;
			}

			var existingLocations = this.locations;

			if (hasProperFormat()) {
				newLocations.forEach(function(loc) {
					if (!locationExistsIn(loc, existingLocations)) {
						existingLocations.push({
							id: loc,
							title: loc
						});
					} else {
						throw new Error('Location already exists');
					}
				});
			} else if (hasExtendFormat()) {
				newLocations.forEach(function(loc) {
					if (!locationExistsIn(loc, existingLocations)) {
						existingLocations.push(loc);
					} else {
						throw new Error('Location already exists');
					}
				});
			}
			else {
				throw new Error('Tried to add locations in wrong format');
			}

			return this;
		},
		addEvent: function(name, location, start, end, options) {
			if (!locationExistsIn(location, this.locations)) {
				throw new Error('Unknown location');
			}
			if (!isValidTimeRange(start, end)) {
				console.log('Invalid time range: ' + JSON.stringify([start, end]));
				return;
			}

			var optionsHasValidType = Object.prototype.toString.call(options) === '[object Object]';
			
			if (name == "now") {
				var existingLocations = this.locations;
				for (var k=0; k<existingLocations.length; k++) {
					var location = existingLocations[k].name;
					var uuid = uuidv4();
					this.events.toBeDisplayed.push({
						name: name,
						location: location,
						uuid: uuid,
						startDate: start,
						endDate: end,
						options: optionsHasValidType ? options : undefined
					});
				}
			} else {
				var uuid = uuidv4();
				this.events.toBeDisplayed.push({
					name: name,
					location: location,
					uuid: uuid,
					startDate: start,
					endDate: end,
					options: optionsHasValidType ? options : undefined
				});
			}

			return this;
		}
	};

	function uuidv4() {
	 	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	    	(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	  	)
	}

	function emptyNode(node) {
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}

	function prettyFormatHour(hour) {
		var prefix = hour < 10 ? '0' : '';
		return prefix + hour + ':00';
	}

	Timetable.Renderer.prototype = {
		setOptions: function(options) {
			for (var option in options) {
				if ((this.authorizedOptions).indexOf(option) == -1) {
					throw new Error('Option "'+option+'" not authorized');
				}
				this.options[option] = options[option];
			}
		},
		insertEvent: function(events) {
			this.draw(this.container, true, events);
		},
		draw: function(selector, isUpdate, events) {
			function checkContainerPrecondition(container) {
				if (container === null) {
					throw new Error('Timetable container not found');
				}
			}
			function appendTimetableAside(container) {
				var asideNode = container.appendChild(document.createElement('aside'));
				var asideULNode = asideNode.appendChild(document.createElement('ul'));
				appendRowHeaders(asideULNode);
			}
			function appendRowHeaders(ulNode) {
				for (var k=0; k<timetable.locations.length; k++) {
					var url = timetable.locations[k].href;
					var liNode = ulNode.appendChild(document.createElement('li'));
					var imgNode = liNode.appendChild(document.createElement('img'));
					imgNode.src = timetable.locations[k].logo_url;
					//imgNode.className  = 'img-thumbnail';
					/*var spanNode = liNode.appendChild(document.createElement('span'));
					if (url !== undefined) {
						var aNode = liNode.appendChild(document.createElement('a'));
						aNode.href = timetable.locations[k].href;
						aNode.appendChild(spanNode);
					}
					spanNode.className = 'row-heading';
					spanNode.textContent = timetable.locations[k].title;*/
				}
			}
			function appendTimetableSection(container) {
				var sectionNode = container.appendChild(document.createElement('section'));
				var timeNode = sectionNode.appendChild(document.createElement('time'));
				appendColumnHeaders(timeNode);
				appendTimeRows(timeNode);
			}
			function appendColumnHeaders(node) {
				var headerNode = node.appendChild(document.createElement('header'));
				var now = new Date();
				var todayText = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
				var yesterday = now.setDate(now.getDate()-1);
				var yesterdayDate = new Date(yesterday);
				var yesterdayText = yesterdayDate.getFullYear()+"-"+(yesterdayDate.getMonth()+1)+"-"+yesterdayDate.getDate();
				var now = new Date();
				var tomorrow = now.setDate(now.getDate()+1);
				var tomorrowDate = new Date(tomorrow);
				var tomorrowText = tomorrowDate.getFullYear()+"-"+(tomorrowDate.getMonth()+1)+"-"+tomorrowDate.getDate();
				var headerULNode = headerNode.appendChild(document.createElement('ul'));
				var liNode = headerULNode.appendChild(document.createElement('li'));
				liNode.setAttribute('data-date', yesterdayText);
				liNode.className = "header-days";
				var spanNode = liNode.appendChild(document.createElement('span'));
				spanNode.textContent = "Hier";
				var liNode = headerULNode.appendChild(document.createElement('li'));
				liNode.setAttribute('data-date', todayText);
				liNode.className = "header-days";
				var spanNode = liNode.appendChild(document.createElement('span'));
				spanNode.textContent = "Aujourd'hui";
				var liNode = headerULNode.appendChild(document.createElement('li'));
				liNode.setAttribute('data-date', tomorrowText);
				liNode.className = "header-days";
				var spanNode = liNode.appendChild(document.createElement('span'));
				spanNode.textContent = "Demain";

				var headerULNode = headerNode.appendChild(document.createElement('ul'));
				var completed = false;
				var looped = 0;
				for (var hour=timetable.scope.hourStart; !completed;) {
					var liNode = headerULNode.appendChild(document.createElement('li'));
					var spanNode = liNode.appendChild(document.createElement('span'));
					spanNode.className = 'time-label';
					spanNode.textContent = prettyFormatHour(hour);
					if (++hour === 25) {
						hour = 1;
						looped += 1;
						if (looped == options.defaultCycleNumber) {
							completed = true;
						}
					}
				}
			}
			function appendTimeRows(node) {
				var ulNode = node.appendChild(document.createElement('ul'));
				ulNode.className = 'room-timeline';
				for (var k=0; k<timetable.locations.length; k++) {
					var liNode = ulNode.appendChild(document.createElement('li'));
					liNode.className = 'channel-timeline';
					liNode.setAttribute('data-channel-uuid', timetable.locations[k].uuid);
					liNode.setAttribute('data-channel-name', timetable.locations[k].name);
					appendLocationEvents(timetable.locations[k], liNode);/**/
				}
				moveToDisplayedEvents("all");
			}
			function appendLocationEvents(location, node) {
				for (var k in timetable.events.toBeDisplayed) {
					var event = timetable.events.toBeDisplayed[k];
					if (event.location === location.id) {
						appendEvent(event, node);
					}
				}
			}
			function appendEvent(event, node) {
				var hasOptions = event.options !== undefined;
				var hasURL, hasAdditionalClass, hasDataAttributes = false;

				if(hasOptions) {
					hasURL = event.options.url !== undefined;
					hasAdditionalClass = event.options.class !== undefined;
					hasDataAttributes = event.options.data !== undefined;
				}

				var elementType = hasURL ? 'a' : 'span';
				var aNode = node.appendChild(document.createElement(elementType));
				var smallNode = aNode.appendChild(document.createElement('small'));
				aNode.title = event.name;

				if (hasURL) {
					aNode.href = event.options.url;
				}
				if(hasDataAttributes){
					for (var key in event.options.data) {
						aNode.setAttribute('data-'+key, event.options.data[key]);
					}
				}

				aNode.className = hasAdditionalClass ? 'time-entry ' + event.options.class : 'time-entry';
				aNode.style.width = computeEventBlockWidth(event);
				if(event.name=="now") {
					aNode.style.width = "0px";
					aNode.style.padding = "0";
					aNode.style.zIndex = "1000";
				}
				aNode.style.left = computeEventBlockOffset(event);
				smallNode.textContent = event.name;
			}
			function moveToDisplayedEvents(event) {
				if (event == "all") {
					timetable.events.displayed = timetable.events.toBeDisplayed;
					timetable.events.toBeDisplayed = [];
				} else {
					var index = null;
					var toBeDisplayedEvents = timetable.events.toBeDisplayed;
					for (var k in toBeDisplayedEvents) {
						var currentEvent = toBeDisplayedEvents[k];
						if (currentEvent.uuid == event.uuid) {
							index = k;
						}
					}
					if (index) {
						delete timetable.events.toBeDisplayed[k];
						timetable.events.displayed.push(event);
					}
				}
			}
			function computeEventBlockWidth(event) {
				var start = event.startDate;
				var end = event.endDate;
				var durationHours = computeDurationInHours(start, end);
				return durationHours / (scopeDurationHours*(getDays().length)) * 100 + '%';
			}
			function computeDurationInHours(start, end) {
				return (end.getTime() - start.getTime()) / 1000 / 60 / 60;
			}
			function computeEventBlockOffset(event) {
				var scopeStartHours = timetable.scope.hourStart;
				var dayOffset = getDayOffset(event);
				if (null == dayOffset) {
					return "-5%";
				}
				var eventStartHours = (event.startDate.getHours() + (event.startDate.getMinutes() / 60)) + dayOffset*24;
				var hoursBeforeEvent = getDurationHours(scopeStartHours, eventStartHours);
				return hoursBeforeEvent / (scopeDurationHours*(getDays().length)) * 100 + '%';
			}
			function getDayOffset(event) {
				var offset = null;
				var eventDay = event.startDate.getFullYear()+"-"+(event.startDate.getMonth()+1)+"-"+event.startDate.getDate();
				var days = getDays();
				for (var index in days) {
					var day = days[index];
					if (days.hasOwnProperty(index)) {
						if (eventDay == day.getAttribute("data-date")) {
							return parseInt(index);
						}	
					}
				};
				return offset;
			}
			function getDays() {
				return document.querySelectorAll(".header-days");
			}
			function getInnerWidth(elem) {
			    var style = window.getComputedStyle(elem);
			    return elem.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeft) - parseFloat(style.borderRight) - parseFloat(style.marginLeft) - parseFloat(style.marginRight);
			}
			function manageInitialOffset(dateTime) {
				var sectionElem = document.querySelector(selector+" section");
				var timeElem = document.querySelector(selector+" section time");
				var event = {startDate: dateTime};
				sectionElem.scrollTo((timeElem.offsetWidth*parseFloat(computeEventBlockOffset(event).replace("%", ""))/100)-200, 0);
			}

			var timetable = this.timetable;
			var scopeDurationHours = getDurationHours(timetable.scope.hourStart, timetable.scope.hourEnd);
			var options = this.options;
			if (isUpdate == undefined || false == isUpdate) {
				this.container = document.querySelector(selector);
				checkContainerPrecondition(this.container);
				emptyNode(this.container);
				appendTimetableAside(this.container);
				appendTimetableSection(this.container);
				if (options.startDateTime == "now") {
					var now = new Date();
					manageInitialOffset(now);
				}
			} else {
				for (var k in events) {
					var event = events[k];
					var myEvent = {};
					myEvent.name = event.title;
					myEvent.location = event.location;
					var uuid = uuidv4();
					myEvent.uuid = uuid;
					myEvent.startDate = new Date(event.date*1000);
					myEvent.endDate = new Date((event.date+event.duration)*1000);
					myEvent.options = event;
					var node = document.querySelector('.channel-timeline[data-channel-name="'+event.location+'"]');
					appendEvent(myEvent, node);
					timetable.events.displayed.push(myEvent);
				}
			}
		}
	};

})();