{
	"patcher": {
		"fileversion": 1,
		"appversion": {
			"major": 9,
			"minor": 0,
			"revision": 7,
			"architecture": "x64",
			"modernui": 1
		},
		"classnamespace": "box",
		"rect": [
			60.0,
			60.0,
			1000.0,
			560.0
		],
		"openinpresentation": 0,
		"default_fontsize": 12.0,
		"default_fontface": 0,
		"default_fontname": "Arial",
		"gridonopen": 1,
		"gridsize": [
			15.0,
			15.0
		],
		"gridsnaponopen": 1,
		"objectsnaponopen": 1,
		"statusbarvisible": 2,
		"toolbarvisible": 1,
		"boxes": [
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.engine: host-agnostic. Talks only through this inlet/outlet; the host adapter (emi.host.max or emi.host.live) owns ports, transport and UI. Every [v8] has one inlet and one outlet (its script runs after the patch loads).",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						10.0,
						900.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from host adapter: play, stop, hello [seed], and everything emi.core handles",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						55.0,
						30.0,
						30.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route hello play stop",
					"numinlets": 2,
					"numoutlets": 4,
					"outlettype": [
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						100.0,
						161.0,
						22.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "v8 emi.hello.bundle.js",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"textfile": {
						"filename": "emi.hello.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"patching_rect": [
						20.0,
						150.0,
						168.0,
						22.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend status",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						185.0,
						112.0,
						22.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "v8 emi.core.bundle.js",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"textfile": {
						"filename": "emi.core.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"patching_rect": [
						420.0,
						150.0,
						161.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "everything else: loadmidi, corpus, compose, stream, need, ... (see code/emi.core.v8.js)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						590.0,
						150.0,
						330.0,
						34.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route coll restart streamat",
					"numinlets": 2,
					"numoutlets": 4,
					"outlettype": [
						"",
						"",
						"",
						""
					],
					"patching_rect": [
						420.0,
						185.0,
						180.0,
						22.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "to the queue and the player; status, error, view, setting pass through",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						610.0,
						185.0,
						330.0,
						20.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "coll ---emi.queue",
					"numinlets": 1,
					"numoutlets": 4,
					"outlettype": [
						"",
						"",
						"",
						"bang"
					],
					"patching_rect": [
						420.0,
						220.0,
						133.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "the queue; the grid player reads the same coll by name",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						560.0,
						220.0,
						330.0,
						20.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "p grid-player",
					"numinlets": 4,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patcher": {
						"fileversion": 1,
						"appversion": {
							"major": 9,
							"minor": 0,
							"revision": 7,
							"architecture": "x64",
							"modernui": 1
						},
						"classnamespace": "box",
						"rect": [
							120.0,
							120.0,
							1100.0,
							720.0
						],
						"openinpresentation": 0,
						"default_fontsize": 12.0,
						"default_fontface": 0,
						"default_fontname": "Arial",
						"gridonopen": 1,
						"gridsize": [
							15.0,
							15.0
						],
						"gridsnaponopen": 1,
						"objectsnaponopen": 1,
						"statusbarvisible": 2,
						"toolbarvisible": 1,
						"boxes": [
							{
								"box": {
									"maxclass": "comment",
									"text": "Grid player: one step per 16th note while the transport runs (Max's, or Live's inside M4L). The step comes from the transport's position, so the queue (step 0 = a barline) starts on the next bar after Play and stays in time through tempo changes. Reads [coll ---emi.queue]; outputs voice <n> <pitch> <velocity>, and need when the stream's last queued phrase starts, and where it is for the piano rolls' playhead. Steps per bar follow the transport's time signature (16 in 4/4, 12 in 3/4). Once the queue has started it plays straight on, a step per tick: if the transport jumps (Link, a moved playhead), the origin moves with it, so the piece doesn't jump back.",
									"numinlets": 1,
									"numoutlets": 0,
									"linecount": 3,
									"patching_rect": [
										20.0,
										10.0,
										1040.0,
										48.0
									],
									"id": "obj-1"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "play (bang, Max's Play): start the queue at the next bar",
									"index": 1,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										70.0,
										30.0,
										30.0
									],
									"id": "obj-2"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "stop (bang): note-offs for sounding notes",
									"index": 2,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										160.0,
										70.0,
										30.0,
										30.0
									],
									"id": "obj-3"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "restart (bang): note-offs; the queue starts again at the bar after this one",
									"index": 3,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										300.0,
										70.0,
										30.0,
										30.0
									],
									"id": "obj-4"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "streamat <step>: send need when the queue reaches it",
									"index": 4,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										900.0,
										70.0,
										30.0,
										30.0
									],
									"id": "obj-5"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "metro 16n @quantize 16n @active 1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"bang"
									],
									"patching_rect": [
										520.0,
										70.0,
										245.0,
										22.0
									],
									"id": "obj-6"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "transport",
									"numinlets": 2,
									"numoutlets": 9,
									"outlettype": [
										"",
										"",
										"",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										520.0,
										105.0,
										77.0,
										22.0
									],
									"id": "obj-7"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "pack 0 0 0.",
									"numinlets": 3,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										520.0,
										140.0,
										90.0,
										22.0
									],
									"id": "obj-8"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "expr ($i1 - 1) * $i4 + ($i2 - 1) * $i5 + int(($f3 + 60.) / 120.)",
									"numinlets": 5,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										520.0,
										175.0,
										330.0,
										22.0
									],
									"id": "obj-9"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "bars beats units -> step",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										860.0,
										140.0,
										160.0,
										20.0
									],
									"id": "obj-10"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "expr 16 / $i1",
									"numinlets": 1,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										760.0,
										70.0,
										90.0,
										22.0
									],
									"id": "obj-11"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "expr $i1 * $i2",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										860.0,
										70.0,
										90.0,
										22.0
									],
									"id": "obj-12"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "time signature -> steps per beat, per bar",
									"numinlets": 1,
									"numoutlets": 0,
									"linecount": 2,
									"patching_rect": [
										960.0,
										70.0,
										130.0,
										34.0
									],
									"id": "obj-13"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t i i i",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"int",
										"int",
										"int"
									],
									"patching_rect": [
										520.0,
										210.0,
										60.0,
										22.0
									],
									"id": "obj-14"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "- 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										700.0,
										245.0,
										40.0,
										22.0
									],
									"id": "obj-15"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "!= 1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										700.0,
										280.0,
										40.0,
										22.0
									],
									"id": "obj-16"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "sel 1",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										""
									],
									"patching_rect": [
										700.0,
										315.0,
										45.0,
										22.0
									],
									"id": "obj-17"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b",
									"numinlets": 1,
									"numoutlets": 1,
									"outlettype": [
										"bang"
									],
									"patching_rect": [
										700.0,
										350.0,
										35.0,
										22.0
									],
									"id": "obj-18"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "- 1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										860.0,
										280.0,
										40.0,
										22.0
									],
									"id": "obj-19"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "sel 0",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										""
									],
									"patching_rect": [
										860.0,
										315.0,
										45.0,
										22.0
									],
									"id": "obj-20"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "+ 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										860.0,
										385.0,
										40.0,
										22.0
									],
									"id": "obj-21"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "a jump: the origin follows it, so the piece plays on",
									"numinlets": 1,
									"numoutlets": 0,
									"linecount": 2,
									"patching_rect": [
										910.0,
										315.0,
										170.0,
										34.0
									],
									"id": "obj-22"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t i i",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										520.0,
										245.0,
										45.0,
										22.0
									],
									"id": "obj-23"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "gate 1 1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										300.0,
										280.0,
										60.0,
										22.0
									],
									"id": "obj-24"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "+ 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										300.0,
										315.0,
										40.0,
										22.0
									],
									"id": "obj-25"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "expr (($i1 + $i2 - 1) / $i2) * $i2",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										300.0,
										350.0,
										190.0,
										22.0
									],
									"id": "obj-26"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b i",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										"int"
									],
									"patching_rect": [
										300.0,
										385.0,
										45.0,
										22.0
									],
									"id": "obj-27"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										300.0,
										420.0,
										30.0,
										22.0
									],
									"id": "obj-28"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "gate open = find the origin on the next step; lead 1 = strictly after",
									"numinlets": 1,
									"numoutlets": 0,
									"linecount": 2,
									"patching_rect": [
										20.0,
										350.0,
										270.0,
										34.0
									],
									"id": "obj-29"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "- 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										520.0,
										420.0,
										40.0,
										22.0
									],
									"id": "obj-30"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t i i",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										860.0,
										420.0,
										45.0,
										22.0
									],
									"id": "obj-31"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "step in the queue",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										570.0,
										420.0,
										120.0,
										20.0
									],
									"id": "obj-32"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t i i",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										520.0,
										455.0,
										45.0,
										22.0
									],
									"id": "obj-33"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "maximum -1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										1060.0,
										455.0,
										80.0,
										22.0
									],
									"id": "obj-34"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "change -2",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"",
										"int",
										"int"
									],
									"patching_rect": [
										1060.0,
										490.0,
										70.0,
										22.0
									],
									"id": "obj-35"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "-1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										1150.0,
										455.0,
										30.0,
										22.0
									],
									"id": "obj-36"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend view playhead",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										1060.0,
										525.0,
										140.0,
										22.0
									],
									"id": "obj-37"
								}
							},
							{
								"box": {
									"maxclass": "outlet",
									"comment": "view playhead <step>: where the queue is, for the piano rolls (-1: hidden)",
									"index": 3,
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										1060.0,
										650.0,
										30.0,
										30.0
									],
									"id": "obj-38"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										245.0,
										30.0,
										22.0
									],
									"id": "obj-39"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										60.0,
										245.0,
										30.0,
										22.0
									],
									"id": "obj-40"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										100.0,
										245.0,
										30.0,
										22.0
									],
									"id": "obj-41"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b b",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										"bang"
									],
									"patching_rect": [
										20.0,
										140.0,
										45.0,
										22.0
									],
									"id": "obj-42"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b b b",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"bang",
										"bang",
										"bang"
									],
									"patching_rect": [
										160.0,
										140.0,
										60.0,
										22.0
									],
									"id": "obj-43"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b b b",
									"numinlets": 1,
									"numoutlets": 3,
									"outlettype": [
										"bang",
										"bang",
										"bang"
									],
									"patching_rect": [
										300.0,
										140.0,
										60.0,
										22.0
									],
									"id": "obj-44"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "< 999999",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										"int"
									],
									"patching_rect": [
										900.0,
										455.0,
										70.0,
										22.0
									],
									"id": "obj-45"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "sel 0",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										""
									],
									"patching_rect": [
										900.0,
										490.0,
										45.0,
										22.0
									],
									"id": "obj-46"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "t b b",
									"numinlets": 1,
									"numoutlets": 2,
									"outlettype": [
										"bang",
										"bang"
									],
									"patching_rect": [
										900.0,
										525.0,
										45.0,
										22.0
									],
									"id": "obj-47"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "999999",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										980.0,
										560.0,
										60.0,
										22.0
									],
									"id": "obj-48"
								}
							},
							{
								"box": {
									"maxclass": "outlet",
									"comment": "need (bang): queue the stream's next phrase",
									"index": 2,
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										900.0,
										650.0,
										30.0,
										30.0
									],
									"id": "obj-49"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "step >= threshold: need, then never again until a new threshold",
									"numinlets": 1,
									"numoutlets": 0,
									"linecount": 2,
									"patching_rect": [
										980.0,
										490.0,
										200.0,
										34.0
									],
									"id": "obj-50"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "coll ---emi.queue",
									"numinlets": 1,
									"numoutlets": 4,
									"outlettype": [
										"",
										"",
										"",
										"bang"
									],
									"patching_rect": [
										520.0,
										490.0,
										133.0,
										22.0
									],
									"id": "obj-51"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "zl.iter 3",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"",
										""
									],
									"patching_rect": [
										520.0,
										525.0,
										77.0,
										22.0
									],
									"id": "obj-52"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "route 1 2 3 4",
									"numinlets": 2,
									"numoutlets": 5,
									"outlettype": [
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										520.0,
										560.0,
										105.0,
										22.0
									],
									"id": "obj-53"
								}
							},
							{
								"box": {
									"maxclass": "outlet",
									"comment": "voice <n> <pitch> <velocity>",
									"index": 1,
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										650.0,
										30.0,
										30.0
									],
									"id": "obj-54"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "[flush] remembers sounding notes, so stop and restart can release them",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										560.0,
										420.0,
										20.0
									],
									"id": "obj-55"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "flush",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										20.0,
										590.0,
										45.0,
										22.0
									],
									"id": "obj-56"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "pack 0 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										615.0,
										60.0,
										22.0
									],
									"id": "obj-57"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend voice 1",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										85.0,
										615.0,
										95.0,
										22.0
									],
									"id": "obj-58"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "flush",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										200.0,
										590.0,
										45.0,
										22.0
									],
									"id": "obj-59"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "pack 0 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										200.0,
										615.0,
										60.0,
										22.0
									],
									"id": "obj-60"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend voice 2",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										265.0,
										615.0,
										95.0,
										22.0
									],
									"id": "obj-61"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "flush",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										380.0,
										590.0,
										45.0,
										22.0
									],
									"id": "obj-62"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "pack 0 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										380.0,
										615.0,
										60.0,
										22.0
									],
									"id": "obj-63"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend voice 3",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										445.0,
										615.0,
										95.0,
										22.0
									],
									"id": "obj-64"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "flush",
									"numinlets": 2,
									"numoutlets": 2,
									"outlettype": [
										"int",
										"int"
									],
									"patching_rect": [
										560.0,
										590.0,
										45.0,
										22.0
									],
									"id": "obj-65"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "pack 0 0",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										560.0,
										615.0,
										60.0,
										22.0
									],
									"id": "obj-66"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend voice 4",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										625.0,
										615.0,
										95.0,
										22.0
									],
									"id": "obj-67"
								}
							}
						],
						"lines": [
							{
								"patchline": {
									"source": [
										"obj-6",
										0
									],
									"destination": [
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-7",
										0
									],
									"destination": [
										"obj-8",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-7",
										1
									],
									"destination": [
										"obj-8",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-7",
										2
									],
									"destination": [
										"obj-8",
										2
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-8",
										0
									],
									"destination": [
										"obj-9",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-7",
										6
									],
									"destination": [
										"obj-11",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-11",
										0
									],
									"destination": [
										"obj-12",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-11",
										0
									],
									"destination": [
										"obj-9",
										4
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-7",
										5
									],
									"destination": [
										"obj-12",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-12",
										0
									],
									"destination": [
										"obj-9",
										3
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-9",
										0
									],
									"destination": [
										"obj-14",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-14",
										2
									],
									"destination": [
										"obj-15",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-14",
										1
									],
									"destination": [
										"obj-15",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-15",
										0
									],
									"destination": [
										"obj-16",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-16",
										0
									],
									"destination": [
										"obj-17",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-15",
										0
									],
									"destination": [
										"obj-19",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-19",
										0
									],
									"destination": [
										"obj-20",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-20",
										1
									],
									"destination": [
										"obj-21",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-14",
										0
									],
									"destination": [
										"obj-23",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-23",
										1
									],
									"destination": [
										"obj-24",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-24",
										0
									],
									"destination": [
										"obj-25",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-25",
										0
									],
									"destination": [
										"obj-26",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-12",
										0
									],
									"destination": [
										"obj-26",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-26",
										0
									],
									"destination": [
										"obj-27",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-27",
										0
									],
									"destination": [
										"obj-28",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-28",
										0
									],
									"destination": [
										"obj-24",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-23",
										0
									],
									"destination": [
										"obj-30",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-27",
										1
									],
									"destination": [
										"obj-31",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-21",
										0
									],
									"destination": [
										"obj-31",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-31",
										1
									],
									"destination": [
										"obj-21",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-31",
										0
									],
									"destination": [
										"obj-30",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-30",
										0
									],
									"destination": [
										"obj-33",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-30",
										0
									],
									"destination": [
										"obj-34",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-34",
										0
									],
									"destination": [
										"obj-35",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
										0
									],
									"destination": [
										"obj-36",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-36",
										0
									],
									"destination": [
										"obj-35",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-35",
										0
									],
									"destination": [
										"obj-37",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-37",
										0
									],
									"destination": [
										"obj-38",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-39",
										0
									],
									"destination": [
										"obj-24",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-40",
										0
									],
									"destination": [
										"obj-25",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-41",
										0
									],
									"destination": [
										"obj-25",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-17",
										0
									],
									"destination": [
										"obj-40",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-2",
										0
									],
									"destination": [
										"obj-42",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-42",
										1
									],
									"destination": [
										"obj-40",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-42",
										0
									],
									"destination": [
										"obj-39",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-3",
										0
									],
									"destination": [
										"obj-43",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-43",
										2
									],
									"destination": [
										"obj-18",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-43",
										1
									],
									"destination": [
										"obj-40",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-43",
										0
									],
									"destination": [
										"obj-39",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-4",
										0
									],
									"destination": [
										"obj-44",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-44",
										2
									],
									"destination": [
										"obj-18",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-44",
										1
									],
									"destination": [
										"obj-41",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-44",
										0
									],
									"destination": [
										"obj-39",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										0
									],
									"destination": [
										"obj-45",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-33",
										1
									],
									"destination": [
										"obj-45",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-45",
										0
									],
									"destination": [
										"obj-46",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-46",
										0
									],
									"destination": [
										"obj-47",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-47",
										1
									],
									"destination": [
										"obj-48",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-48",
										0
									],
									"destination": [
										"obj-45",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-47",
										0
									],
									"destination": [
										"obj-49",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-33",
										0
									],
									"destination": [
										"obj-51",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-51",
										0
									],
									"destination": [
										"obj-52",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-52",
										0
									],
									"destination": [
										"obj-53",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-53",
										0
									],
									"destination": [
										"obj-56",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-56",
										0
									],
									"destination": [
										"obj-57",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-56",
										1
									],
									"destination": [
										"obj-57",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-57",
										0
									],
									"destination": [
										"obj-58",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-58",
										0
									],
									"destination": [
										"obj-54",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-18",
										0
									],
									"destination": [
										"obj-56",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-53",
										1
									],
									"destination": [
										"obj-59",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-59",
										0
									],
									"destination": [
										"obj-60",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-59",
										1
									],
									"destination": [
										"obj-60",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-60",
										0
									],
									"destination": [
										"obj-61",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-61",
										0
									],
									"destination": [
										"obj-54",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-18",
										0
									],
									"destination": [
										"obj-59",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-53",
										2
									],
									"destination": [
										"obj-62",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-62",
										0
									],
									"destination": [
										"obj-63",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-62",
										1
									],
									"destination": [
										"obj-63",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-63",
										0
									],
									"destination": [
										"obj-64",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-64",
										0
									],
									"destination": [
										"obj-54",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-18",
										0
									],
									"destination": [
										"obj-62",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-53",
										3
									],
									"destination": [
										"obj-65",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-65",
										0
									],
									"destination": [
										"obj-66",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-65",
										1
									],
									"destination": [
										"obj-66",
										1
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-66",
										0
									],
									"destination": [
										"obj-67",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-67",
										0
									],
									"destination": [
										"obj-54",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-18",
										0
									],
									"destination": [
										"obj-65",
										0
									]
								}
							}
						]
					},
					"patching_rect": [
						200.0,
						290.0,
						110.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "deferlow",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						330.0,
						65.0,
						22.0
					],
					"id": "obj-13"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "need",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						365.0,
						40.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "need comes from the scheduler thread: compose on the main thread",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						500.0,
						330.0,
						330.0,
						20.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "outlet",
					"comment": "to host, panel and view: voice <n> <pitch> <velocity> | status ... | error ... | view ... | setting ...",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						420.0,
						30.0,
						30.0
					],
					"id": "obj-16"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-2",
						0
					],
					"destination": [
						"obj-3",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-3",
						0
					],
					"destination": [
						"obj-4",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-4",
						0
					],
					"destination": [
						"obj-5",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-3",
						3
					],
					"destination": [
						"obj-6",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-6",
						0
					],
					"destination": [
						"obj-8",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						0
					],
					"destination": [
						"obj-10",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-3",
						1
					],
					"destination": [
						"obj-12",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-3",
						2
					],
					"destination": [
						"obj-12",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						1
					],
					"destination": [
						"obj-12",
						2
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						2
					],
					"destination": [
						"obj-12",
						3
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-12",
						1
					],
					"destination": [
						"obj-13",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-13",
						0
					],
					"destination": [
						"obj-14",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-14",
						0
					],
					"destination": [
						"obj-6",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-5",
						0
					],
					"destination": [
						"obj-16",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-8",
						3
					],
					"destination": [
						"obj-16",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-12",
						0
					],
					"destination": [
						"obj-16",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-12",
						2
					],
					"destination": [
						"obj-16",
						0
					]
				}
			}
		]
	}
}
