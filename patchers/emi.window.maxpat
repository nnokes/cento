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
			1240.0,
			810.0
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
		"statusbarvisible": 0,
		"toolbarvisible": 0,
		"boxes": [
			{
				"box": {
					"maxclass": "comment",
					"text": "emi.window: the pop-up window (both products). A large piano roll (the same script as the panels' roll, emi.view) and Magdalena's taste in full (emi.taste). Opened by the Magdalena panel's window button, through [pcontrol] in the top patch.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						20.0,
						900.0,
						900.0,
						34.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine: view ..., emilyview ...",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						20.0,
						30.0,
						30.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "outlet",
					"comment": "to emi.engine: select (from the roll), like, dislike, taste",
					"index": 1,
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						860.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route view emilyview",
					"numinlets": 2,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						""
					],
					"patching_rect": [
						20.0,
						60.0,
						140.0,
						22.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.view.bundle.js",
					"varname": "Piano roll",
					"textfile": {
						"filename": "emi.view.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"parameter_enable": 0,
					"border": 0,
					"patching_rect": [
						20.0,
						100.0,
						1160.0,
						430.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						10.0,
						1160.0,
						430.0
					],
					"id": "obj-5",
					"hint": "The current piece, large. Colours: the chorale each beat came from. Bright lines: seams between beats; gold bands: signatures; red marks: new parallel fifths or octaves; purple dots: notes Magdalena varied; yellow line: the playhead. Drag across beats to select them for like, dislike and accept (a click clears); hover over a beat to see where it came from, and over the SPEAC lane's letters (along the bottom) for what each means.",
					"annotation": "The current piece, large. Colours: the chorale each beat came from. Bright lines: seams between beats; gold bands: signatures; red marks: new parallel fifths or octaves; purple dots: notes Magdalena varied; yellow line: the playhead. Drag across beats to select them for like, dislike and accept (a click clears); hover over a beat to see where it came from, and over the SPEAC lane's letters (along the bottom) for what each means.",
					"annotation_name": "Piano roll"
				}
			},
			{
				"box": {
					"maxclass": "v8ui",
					"filename": "emi.taste.bundle.js",
					"varname": "Taste",
					"textfile": {
						"filename": "emi.taste.bundle.js",
						"flags": 0,
						"embed": 0,
						"autowatch": 1
					},
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"parameter_enable": 0,
					"border": 0,
					"patching_rect": [
						20.0,
						540.0,
						1160.0,
						250.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						450.0,
						1160.0,
						250.0
					],
					"id": "obj-6",
					"hint": "The user's taste, as Magdalena has learned it, in three views, chosen by the tabs at its top right: overview (what she likes and dislikes most, her latest ratings, the last taste comparison), weights and memory. Hover over a tab, slider or button for what it does.",
					"annotation": "The user's taste, as Magdalena has learned it, in three views, chosen by the tabs at its top right: overview (what she likes and dislikes most, her latest ratings, the last taste comparison), weights and memory. Hover over a tab, slider or button for what it does.",
					"annotation_name": "Magdalena's taste"
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
						20.0,
						820.0,
						56.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						10.0,
						710.0,
						56.0,
						24.0
					],
					"id": "obj-7",
					"hint": "Tell Magdalena you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes.",
					"annotation": "Tell Magdalena you like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns which musical features it has, and prefers them when she composes.",
					"annotation_name": "like"
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
						80.0,
						820.0,
						56.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						70.0,
						710.0,
						56.0,
						24.0
					],
					"id": "obj-8",
					"hint": "Tell Magdalena you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features.",
					"annotation": "Tell Magdalena you don't like what you're hearing: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She learns to avoid its musical features.",
					"annotation_name": "dislike"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "keep",
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
						140.0,
						760.0,
						44.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						130.0,
						710.0,
						46.0,
						24.0
					],
					"id": "obj-9",
					"hint": "Keep what you're hearing in Magdalena's notebook: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab).",
					"annotation": "Keep what you're hearing in Magdalena's notebook: the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece. She composes from it alongside Bach from then on (how much: mix, in the pop-up window's memory tab).",
					"annotation_name": "keep"
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
						140.0,
						790.0,
						35.0,
						22.0
					],
					"id": "obj-10"
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
						140.0,
						820.0,
						58.0,
						22.0
					],
					"id": "obj-11"
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
						200.0,
						760.0,
						100.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						180.0,
						710.0,
						72.0,
						24.0
					],
					"id": "obj-12",
					"hint": "Report Magdalena's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing.",
					"annotation": "Report Magdalena's taste: what she likes and dislikes most, in the Max window, and ten pieces composed with and without her taste, compared feature by feature. The pop-up window shows its progress (it composes a piece at a time, so you can go on playing) and the result. It changes nothing.",
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
						200.0,
						790.0,
						35.0,
						22.0
					],
					"id": "obj-13"
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
						200.0,
						820.0,
						51.0,
						22.0
					],
					"id": "obj-14"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "reload seed",
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
						260.0,
						760.0,
						90.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						256.0,
						710.0,
						90.0,
						24.0
					],
					"id": "obj-15",
					"hint": "Compose the seed shown again, with Magdalena's taste, mix and novelty as they are now, to hear and see what your changes did. With stream on, the stream starts again.",
					"annotation": "Compose the seed shown again, with Magdalena's taste, mix and novelty as they are now, to hear and see what your changes did. With stream on, the stream starts again.",
					"annotation_name": "reload seed"
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
						260.0,
						790.0,
						35.0,
						22.0
					],
					"id": "obj-16"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "compose",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260.0,
						820.0,
						60.0,
						22.0
					],
					"id": "obj-17"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "release all pins",
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
						430.0,
						760.0,
						120.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						356.0,
						710.0,
						120.0,
						24.0
					],
					"id": "obj-18",
					"hint": "Release every pinned weight: each goes back to what Magdalena learned from your ratings.",
					"annotation": "Release every pinned weight: each goes back to what Magdalena learned from your ratings.",
					"annotation_name": "release all pins"
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
						410.0,
						790.0,
						35.0,
						22.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "unpin",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						410.0,
						820.0,
						50.0,
						22.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "store taste",
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
						580.0,
						760.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						486.0,
						710.0,
						95.0,
						24.0
					],
					"id": "obj-21",
					"hint": "Save Magdalena's whole taste (weights, pins, strength, ratings) to a file you choose.",
					"annotation": "Save Magdalena's whole taste (weights, pins, strength, ratings) to a file you choose.",
					"annotation_name": "store taste"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route store",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						580.0,
						790.0,
						80.0,
						22.0
					],
					"id": "obj-22"
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
						580.0,
						820.0,
						35.0,
						22.0
					],
					"id": "obj-23"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "savedialog",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						580.0,
						850.0,
						110.0,
						22.0
					],
					"id": "obj-24"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend storetaste",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						580.0,
						880.0,
						120.0,
						22.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "recall taste",
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
						720.0,
						760.0,
						100.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						587.0,
						710.0,
						95.0,
						24.0
					],
					"id": "obj-26",
					"hint": "Load a taste saved with store taste and make it hers. The taste it replaces is kept as a backup and as a snapshot.",
					"annotation": "Load a taste saved with store taste and make it hers. The taste it replaces is kept as a backup and as a snapshot.",
					"annotation_name": "recall taste"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route recall",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						720.0,
						790.0,
						80.0,
						22.0
					],
					"id": "obj-27"
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
						720.0,
						820.0,
						35.0,
						22.0
					],
					"id": "obj-28"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "opendialog",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						720.0,
						850.0,
						110.0,
						22.0
					],
					"id": "obj-29"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend recalltaste",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						720.0,
						880.0,
						120.0,
						22.0
					],
					"id": "obj-30"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "forget",
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
						860.0,
						820.0,
						60.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						688.0,
						710.0,
						60.0,
						24.0
					],
					"id": "obj-31",
					"hint": "Start a new taste from nothing. The old one is kept as a backup and as a snapshot, so you can roll back to it.",
					"annotation": "Start a new taste from nothing. The old one is kept as a backup and as a snapshot, so you can roll back to it.",
					"annotation_name": "forget"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "explain Magdalena",
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
						1000.0,
						760.0,
						130.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						758.0,
						710.0,
						130.0,
						24.0
					],
					"id": "obj-32",
					"hint": "Who Magdalena is and what she does: she learns the user's taste, keeps a notebook of the music you keep, and is named after Anna Magdalena Bach.",
					"annotation": "Who Magdalena is and what she does: she learns the user's taste, keeps a notebook of the music you keep, and is named after Anna Magdalena Bach.",
					"annotation_name": "explain Magdalena"
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
						1000.0,
						790.0,
						35.0,
						22.0
					],
					"id": "obj-33"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1000.0,
						820.0,
						40.0,
						22.0
					],
					"id": "obj-34"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "pcontrol",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1050.0,
						820.0,
						60.0,
						22.0
					],
					"id": "obj-35"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "emi.magdalena",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1000.0,
						855.0,
						100.0,
						22.0
					],
					"id": "obj-36"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Drag across the roll to select beats for like, dislike and keep. Hover over anything for what it does; the tabs at the pane's top right choose its view.",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 3,
					"fontsize": 10.0,
					"patching_rect": [
						940.0,
						900.0,
						400.0,
						44.0
					],
					"presentation": 1,
					"presentation_rect": [
						896.0,
						706.0,
						274.0,
						44.0
					],
					"id": "obj-37"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "loadbang",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"bang"
					],
					"patching_rect": [
						700.0,
						20.0,
						70.0,
						22.0
					],
					"id": "obj-38"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "title Cento: piano roll and Magdalena",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						700.0,
						55.0,
						250.0,
						22.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "thispatcher",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						700.0,
						90.0,
						80.0,
						22.0
					],
					"id": "obj-40"
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
						"obj-5",
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
						"obj-4",
						1
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
						"obj-3",
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
						"obj-3",
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
						"obj-3",
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
						"obj-3",
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
						"obj-18",
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
						"obj-3",
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
						"obj-24",
						0
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
						"obj-3",
						0
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
						"obj-29",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-29",
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
						"obj-30",
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
						"obj-31",
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
						"obj-32",
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
						"obj-33",
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
						"obj-35",
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
						"obj-38",
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
						"obj-39",
						0
					],
					"destination": [
						"obj-40",
						0
					]
				}
			}
		]
	}
}
