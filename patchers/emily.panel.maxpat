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
			80.0,
			80.0,
			1000.0,
			620.0
		],
		"openinpresentation": 1,
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
					"text": "emily.panel: Emily's taste (M9), shared by both products. like and dislike rate the beats selected in the piano roll, or the stream phrase playing, or the piece; temperature sets how much chance still plays; accept keeps what is playing as music of her own (M10). like, dislike, accept and temperature are live.* parameters, so they can be MIDI- or key-mapped. Panel 130 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						20.0,
						5.0,
						900.0,
						48.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: emily, setting",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						60.0,
						30.0,
						30.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "outlet",
					"comment": "to emi.engine",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						560.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "EMILY",
					"numinlets": 1,
					"numoutlets": 0,
					"fontsize": 10.0,
					"fontface": 1,
					"textcolor": [
						0.55,
						0.55,
						0.55,
						1.0
					],
					"patching_rect": [
						20.0,
						100.0,
						120.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						1.0,
						60.0,
						18.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "window",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"bgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"patching_rect": [
						600.0,
						300.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						67.0,
						53.0,
						57.0,
						20.0
					],
					"id": "obj-5",
					"hint": "Open the pop-up window: a large piano roll and Emily's taste in full, where you can edit her weights and see her memory.",
					"annotation": "Open the pop-up window: a large piano roll and Emily's taste in full, where you can edit her weights and see her memory.",
					"annotation_name": "window"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "s ---emi.window",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						600.0,
						335.0,
						110.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "live.text",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"parameter_enable": 1,
					"varname": "Like",
					"mode": 0,
					"text": "like",
					"texton": "like",
					"bgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"activebgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"bgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"activebgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"textoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Like",
							"parameter_shortname": "like",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						20.0,
						140.0,
						57.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						19.0,
						57.0,
						30.0
					],
					"id": "obj-7",
					"hint": "Tell Emily you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "Tell Emily you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "Like"
				}
			},
			{
				"box": {
					"maxclass": "live.text",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"parameter_enable": 1,
					"varname": "Dislike",
					"mode": 0,
					"text": "dislike",
					"texton": "dislike",
					"bgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"activebgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"bgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"activebgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"textoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Dislike",
							"parameter_shortname": "dislike",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						120.0,
						140.0,
						57.0,
						30.0
					],
					"presentation": 1,
					"presentation_rect": [
						67.0,
						19.0,
						57.0,
						30.0
					],
					"id": "obj-8",
					"hint": "Tell Emily you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "Tell Emily you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features. Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "Dislike"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "like",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						185.0,
						55.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "dislike",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						120.0,
						185.0,
						55.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "live.dial",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Temperature",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_longname": "Temperature",
							"parameter_shortname": "chance",
							"parameter_type": 0,
							"parameter_mmin": 0.0,
							"parameter_mmax": 3.0,
							"parameter_initial": [
								1.0
							],
							"parameter_initial_enable": 1,
							"parameter_unitstyle": 1
						}
					},
					"patching_rect": [
						240.0,
						140.0,
						44.0,
						44.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						76.0,
						44.0,
						44.0
					],
					"id": "obj-11",
					"hint": "How much chance still plays when composing (Emily's temperature). 0: only Emily's favourite choices; 1: as before Emily (the default); up to 3: more adventurous.",
					"annotation": "How much chance still plays when composing (Emily's temperature). 0: only Emily's favourite choices; 1: as before Emily (the default); up to 3: more adventurous.",
					"annotation_name": "chance"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend temperature",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						240.0,
						200.0,
						130.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "taste report",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"bgcolor": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"bgfillcolor_type": "color",
					"bgfillcolor_color": [
						0.8,
						0.85,
						0.93,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"fontsize": 10.0,
					"patching_rect": [
						400.0,
						140.0,
						100.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						54.0,
						80.0,
						70.0,
						20.0
					],
					"id": "obj-13",
					"hint": "Report Emily's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing.",
					"annotation": "Report Emily's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing.",
					"annotation_name": "taste report"
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
						400.0,
						170.0,
						35.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "taste",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						400.0,
						200.0,
						51.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "live.text",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"parameter_enable": 1,
					"varname": "Accept",
					"mode": 0,
					"text": "keep",
					"texton": "keep",
					"bgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"activebgcolor": [
						0.96,
						0.84,
						0.7,
						1.0
					],
					"bgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"activebgoncolor": [
						0.91,
						0.62,
						0.36,
						1.0
					],
					"textcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextcolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"textoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"activetextoncolor": [
						0.08,
						0.08,
						0.09,
						1.0
					],
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"off",
								"on"
							],
							"parameter_longname": "Accept",
							"parameter_shortname": "keep",
							"parameter_type": 2,
							"parameter_mmax": 1,
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 0
						}
					},
					"patching_rect": [
						460.0,
						140.0,
						64.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						53.0,
						57.0,
						20.0
					],
					"id": "obj-16",
					"hint": "Keep what you're hearing as a work of Emily's own: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab). Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation": "Keep what you're hearing as a work of Emily's own: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab). Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live).",
					"annotation_name": "keep"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "accept",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						460.0,
						185.0,
						55.0,
						22.0
					],
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "chance (temperature): 0 Emily's favourite choices only, 1 as before Emily, 3 adventurous. taste report: her taste in the Max window and ten pieces compared; keep (accept, M10)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"patching_rect": [
						520.0,
						220.0,
						330.0,
						48.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route emily setting",
					"numinlets": 2,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						300.0,
						120.0,
						22.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend text",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						340.0,
						98.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.text.bundle.js",
					"varname": "Emily",
					"textfile": {
						"filename": "emi.text.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"parameter_enable": 0,
					"border": 0,
					"patching_rect": [
						20.0,
						380.0,
						118.0,
						44.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						123.0,
						118.0,
						43.0
					],
					"id": "obj-21",
					"hint": "Emily in a line: how many ratings she has had, and what she likes and dislikes most.",
					"annotation": "Emily in a line: how many ratings she has had, and what she likes and dislikes most.",
					"annotation_name": "Emily"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route temperature",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						200.0,
						340.0,
						110.0,
						22.0
					],
					"id": "obj-22"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend set",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						200.0,
						380.0,
						91.0,
						22.0
					],
					"id": "obj-23"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "setting temperature <t>: show a restored value without sending it back",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						330.0,
						380.0,
						300.0,
						20.0
					],
					"id": "obj-24"
				}
			}
		],
		"lines": [
			{
				"patchline": {
					"source": [
						"obj-5",
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
						"obj-7",
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
						"obj-9",
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
						"obj-10",
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
						"obj-11",
						0
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
						"obj-3",
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
						"obj-15",
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
						"obj-3",
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
						"obj-17",
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
						"obj-2",
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
						0
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
						"obj-19",
						1
					],
					"destination": [
						"obj-22",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-22",
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
						0
					],
					"destination": [
						"obj-11",
						0
					]
				}
			}
		]
	}
}
