var WhiteKey = Backbone.View.extend({
	initialize: function(opts){
			this.note = opts.note;	
		   },
	className: 'whitekey',
	render: function(){
		 this.$el.data('note',this.note);
		},
	keypress: function(){
		this.$el.toggleClass("keypressed");
		},
	keyremove: function(){
		this.$el.toggleClass("keypressed");
		}
});

var BlackKey = Backbone.View.extend({
	initialize: function(opts){
			this.note = opts.note;	
		   },
	className: 'blackkey',
	render: function(){ 
 		   var bkinner = $("<div class='blackkeyinner'></div>");
		   bkinner.data('note',this.note);
		   this.$el.append(bkinner);
		},
	keypress: function(){
		this.$el.children('.blackkeyinner').toggleClass("keypressed");
		},
	keyremove: function(){
		this.$el.children('.blackkeyinner').toggleClass("keypressed");
		}
});

var Octave = Backbone.View.extend({
	initialize: function(opts){

				this.base = opts.base;

				this.keys = [];
				var i = 1;
				while(i<=12){
                                   var note = this.base*12+i;
				   var whitekey = new WhiteKey({note:note});
			           this.keys.push(whitekey);		
				   i++;

				   if(i!=6 && i!=13){	
				    var note = this.base*12+i;
				    var blackkey = new BlackKey({note:note});				   
				    this.keys.push(blackkey);
				    i++;
				   }
				}
			     },
	className: 'octave',
	render: function() {
			      this.keys.forEach(function(key){
							key.render();
						 	this.$el.append(key.el);
						   },this);
			   }
});

var Keyboard = Backbone.View.extend({
	initialize: function(opts){


			this.midi=[];
			this.oscillators=[];
			this.base = opts.base;
			this.ctx = new AudioContext();
	
			for (var x = 0; x < 127; ++x){
 			     this.midi[x] = 440 * Math.pow(2, (x - 69) / 12);
			     var osc = this.ctx.createOscillator();
			     osc.type = 'sawtooth';
			     osc.frequency.setTargetAtTime(this.midi[x],0,0);
			     osc.start();
			     this.oscillators.push(osc);
			}
                       

			this.numoctaves = opts.numoctaves;
			this.octaves = [];
			for(var i=this.base; i<this.base+this.numoctaves; i++){
			    var octave = new Octave({base:i});
			    this.octaves.push(octave);			
			}
	
		    },
	className: 'keyboard',
	render: function() {
			     this.octaves.forEach(function(octave){
							octave.render();
							this.$el.append(octave.el);
						      },this);	
			   },
	events: {
		'mousedown .octave .whitekey': 'playKey',
		'mousedown .octave .blackkeyinner': 'playKey',
		'mouseup .octave .whitekey': 'stopKey',
		'mouseup .octave .blackkeyinner': 'stopKey',
	},

	playKey: function(ev){
			var midinote = $(ev.target).data('note');
			var osc = this.oscillators[midinote];
 			osc.connect(this.ctx.destination);
	},

	stopKey: function(ev){
			var midinote = $(ev.target).data('note');
			var osc = this.oscillators[midinote];
 			osc.disconnect();
	},

	playNote: function(note){
			var octave = Math.floor(note/12);
			console.log(octave);
			var midinote = ((octave+this.base)*12) + note%12;
			var osc = this.oscillators[midinote];
 			osc.connect(this.ctx.destination);
			var key = this.getKey(octave,note);
			key.keypress();
	},

	stopNote: function(note){
			var octave = Math.floor(note/12);
			var midinote = ((octave+this.base)*12) + note%12;
			var osc = this.oscillators[midinote];
 			osc.disconnect();
			var key = this.getKey(octave,note);
			key.keyremove();
	},
	getKey:	function(octave,note){
			var octave = this.octaves[octave];
		        var key = octave.keys[note%12];
			return key;
	}
});


var keycodes = [65,87,83,69,68,70,84,71,89,72,85,74,75,79,76];
var keyboard = new Keyboard({numoctaves:2,base:5});
keyboard.render();
document.body.appendChild(keyboard.el);

$(document).keydown(function(event) { 

  if(keycodes.indexOf(event.keyCode) > -1){
	var ind = keycodes.indexOf(event.keyCode);
	keyboard.playNote(ind);	
   }
});

$(document).keyup(function(event) { 
	var ind = keycodes.indexOf(event.keyCode);
	keyboard.stopNote(ind);	
});

window.navigator.requestMIDIAccess();
