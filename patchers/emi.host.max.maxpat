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
			40.0,
			40.0,
			1300.0,
			760.0
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
					"text": "emi.host.max: the Max version's adapter: transport, MIDI ports, vst~ instruments, file dialogs. Panel 520 x 169 px.",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						5.0,
						900.0,
						20.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "inlet",
					"comment": "from emi.engine",
					"index": 1,
					"numinlets": 0,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						30.0,
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
						720.0,
						30.0,
						30.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "ml_midi (Max)",
					"numinlets": 1,
					"numoutlets": 0,
					"fontface": 1,
					"patching_rect": [
						20.0,
						70.0,
						110.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						4.0,
						120.0,
						20.0
					],
					"id": "obj-4"
				}
			},
			{
				"box": {
					"maxclass": "toggle",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"parameter_enable": 0,
					"patching_rect": [
						150.0,
						70.0,
						22.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						130.0,
						4.0,
						20.0,
						20.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Play",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						175.0,
						70.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						152.0,
						4.0,
						40.0,
						20.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "number",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"minimum": 20,
					"maximum": 300,
					"parameter_enable": 0,
					"patching_rect": [
						230.0,
						70.0,
						50.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						200.0,
						4.0,
						50.0,
						20.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "BPM",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						285.0,
						70.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						252.0,
						4.0,
						40.0,
						20.0
					],
					"id": "obj-8"
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
						330.0,
						30.0,
						70.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "100",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						330.0,
						70.0,
						40.0,
						22.0
					],
					"id": "obj-10"
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
						270.0,
						230.0,
						77.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend tempo",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						110.0,
						105.0,
						22.0
					],
					"id": "obj-12"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 1 0",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"bang",
						""
					],
					"patching_rect": [
						150.0,
						110.0,
						55.0,
						22.0
					],
					"id": "obj-13"
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
						100.0,
						145.0,
						45.0,
						22.0
					],
					"id": "obj-14"
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
						170.0,
						145.0,
						45.0,
						22.0
					],
					"id": "obj-15"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "play",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						60.0,
						180.0,
						40.0,
						22.0
					],
					"id": "obj-16"
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
						110.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-17"
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
						170.0,
						180.0,
						30.0,
						22.0
					],
					"id": "obj-18"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "stop",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						210.0,
						180.0,
						40.0,
						22.0
					],
					"id": "obj-19"
				}
			},
			{
				"box": {
					"maxclass": "ezdac~",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						720.0,
						70.0,
						32.0,
						32.0
					],
					"presentation": 1,
					"presentation_rect": [
						484.0,
						0.0,
						30.0,
						30.0
					],
					"id": "obj-20"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "load chorale",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						30.0,
						100.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						30.0,
						92.0,
						20.0
					],
					"id": "obj-21"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route load",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						420.0,
						60.0,
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
						420.0,
						90.0,
						35.0,
						22.0
					],
					"id": "obj-23"
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
						420.0,
						120.0,
						110.0,
						22.0
					],
					"id": "obj-24"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend loadmidi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						150.0,
						120.0,
						22.0
					],
					"id": "obj-25"
				}
			},
			{
				"box": {
					"maxclass": "toggle",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"parameter_enable": 0,
					"patching_rect": [
						560.0,
						30.0,
						22.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						102.0,
						30.0,
						20.0,
						20.0
					],
					"id": "obj-26"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "original key",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						585.0,
						30.0,
						90.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						124.0,
						30.0,
						86.0,
						20.0
					],
					"id": "obj-27"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sel 0 1",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"bang",
						""
					],
					"patching_rect": [
						560.0,
						60.0,
						55.0,
						22.0
					],
					"id": "obj-28"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "key c",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						560.0,
						90.0,
						45.0,
						22.0
					],
					"id": "obj-29"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "key original",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						615.0,
						90.0,
						80.0,
						22.0
					],
					"id": "obj-30"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "pattern",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						710.0,
						30.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						214.0,
						30.0,
						65.0,
						20.0
					],
					"id": "obj-31"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "clear",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						780.0,
						30.0,
						51.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						284.0,
						30.0,
						51.0,
						20.0
					],
					"id": "obj-32"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "load corpus",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						200.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						56.0,
						88.0,
						20.0
					],
					"id": "obj-33"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route load",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						420.0,
						230.0,
						80.0,
						22.0
					],
					"id": "obj-34"
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
						420.0,
						260.0,
						35.0,
						22.0
					],
					"id": "obj-35"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "opendialog fold",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"patching_rect": [
						420.0,
						290.0,
						110.0,
						22.0
					],
					"id": "obj-36"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend corpus",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						420.0,
						320.0,
						120.0,
						22.0
					],
					"id": "obj-37"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "choose ~/Documents/ml_midi/corpus (all chorales in it are read)",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						550.0,
						290.0,
						230.0,
						34.0
					],
					"id": "obj-38"
				}
			},
			{
				"box": {
					"maxclass": "number",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"minimum": 1,
					"maximum": 99999,
					"parameter_enable": 0,
					"patching_rect": [
						820.0,
						260.0,
						50.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						198.0,
						56.0,
						44.0,
						20.0
					],
					"id": "obj-39"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "seed",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						875.0,
						260.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						166.0,
						56.0,
						32.0,
						20.0
					],
					"id": "obj-40"
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
						820.0,
						200.0,
						70.0,
						22.0
					],
					"id": "obj-41"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "set 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						820.0,
						230.0,
						45.0,
						22.0
					],
					"id": "obj-42"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend compose",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						820.0,
						300.0,
						110.0,
						22.0
					],
					"id": "obj-43"
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
						710.0,
						200.0,
						65.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						98.0,
						56.0,
						64.0,
						20.0
					],
					"id": "obj-44"
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
						710.0,
						230.0,
						35.0,
						22.0
					],
					"id": "obj-45"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "new",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						940.0,
						200.0,
						37.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						246.0,
						56.0,
						40.0,
						20.0
					],
					"id": "obj-46"
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
						940.0,
						230.0,
						35.0,
						22.0
					],
					"id": "obj-47"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "i",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						940.0,
						260.0,
						35.0,
						22.0
					],
					"id": "obj-48"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "+ 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						940.0,
						290.0,
						40.0,
						22.0
					],
					"id": "obj-49"
				}
			},
			{
				"box": {
					"maxclass": "number",
					"numinlets": 1,
					"numoutlets": 2,
					"outlettype": [
						"",
						"bang"
					],
					"minimum": 4,
					"maximum": 256,
					"parameter_enable": 0,
					"patching_rect": [
						1020.0,
						260.0,
						50.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						326.0,
						56.0,
						40.0,
						20.0
					],
					"id": "obj-50"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "beats",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						1075.0,
						260.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						290.0,
						56.0,
						36.0,
						20.0
					],
					"id": "obj-51"
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
						1020.0,
						200.0,
						70.0,
						22.0
					],
					"id": "obj-52"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "set 32",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1020.0,
						230.0,
						50.0,
						22.0
					],
					"id": "obj-53"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend beats",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1020.0,
						300.0,
						100.0,
						22.0
					],
					"id": "obj-54"
				}
			},
			{
				"box": {
					"maxclass": "toggle",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"parameter_enable": 0,
					"patching_rect": [
						870.0,
						90.0,
						22.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						340.0,
						30.0,
						20.0,
						20.0
					],
					"id": "obj-55"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "form",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						895.0,
						90.0,
						40.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						362.0,
						30.0,
						34.0,
						20.0
					],
					"id": "obj-56"
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
						870.0,
						30.0,
						70.0,
						22.0
					],
					"id": "obj-57"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "set 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						870.0,
						60.0,
						45.0,
						22.0
					],
					"id": "obj-58"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend form",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						870.0,
						125.0,
						90.0,
						22.0
					],
					"id": "obj-59"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "export midi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1100.0,
						30.0,
						93.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						370.0,
						56.0,
						80.0,
						20.0
					],
					"id": "obj-60"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route export",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						1100.0,
						60.0,
						80.0,
						22.0
					],
					"id": "obj-61"
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
						1100.0,
						90.0,
						35.0,
						22.0
					],
					"id": "obj-62"
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
						1100.0,
						120.0,
						110.0,
						22.0
					],
					"id": "obj-63"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend exportmidi",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						1100.0,
						150.0,
						120.0,
						22.0
					],
					"id": "obj-64"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "Output",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						300.0,
						50.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						82.0,
						50.0,
						20.0
					],
					"id": "obj-65"
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
						80.0,
						270.0,
						70.0,
						22.0
					],
					"id": "obj-66"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiinfo",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						80.0,
						300.0,
						70.0,
						22.0
					],
					"id": "obj-67"
				}
			},
			{
				"box": {
					"maxclass": "umenu",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"int",
						"",
						""
					],
					"parameter_enable": 0,
					"items": [],
					"patching_rect": [
						80.0,
						335.0,
						170.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						56.0,
						82.0,
						190.0,
						20.0
					],
					"id": "obj-68"
				}
			},
			{
				"box": {
					"maxclass": "toggle",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"parameter_enable": 0,
					"patching_rect": [
						300.0,
						300.0,
						22.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						256.0,
						82.0,
						20.0,
						20.0
					],
					"id": "obj-69"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "vst~ instead",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						325.0,
						300.0,
						90.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						278.0,
						82.0,
						90.0,
						20.0
					],
					"id": "obj-70"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "+ 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						300.0,
						335.0,
						40.0,
						22.0
					],
					"id": "obj-71"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-72"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 1",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						234.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-73"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 2",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						90.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						62.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-74"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 2",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						90.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						290.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-75"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						160.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						118.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-76"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 3",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						160.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						346.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-77"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "plug 4",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						600.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						174.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-78"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "open 4",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						230.0,
						630.0,
						58.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						402.0,
						108.0,
						52.0,
						20.0
					],
					"id": "obj-79"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "route voice status error",
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
						400.0,
						182.0,
						22.0
					],
					"id": "obj-80"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "gate 2 1",
					"numinlets": 2,
					"numoutlets": 2,
					"outlettype": [
						"",
						""
					],
					"patching_rect": [
						400.0,
						400.0,
						60.0,
						22.0
					],
					"id": "obj-81"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "p midi-out",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
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
							140.0,
							140.0,
							640.0,
							360.0
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
									"maxclass": "inlet",
									"comment": "voice <n> <pitch> <velocity> (voice prefix removed)",
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
									"id": "obj-1"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "MIDI output port name",
									"index": 2,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										400.0,
										20.0,
										30.0,
										30.0
									],
									"id": "obj-2"
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
										20.0,
										70.0,
										105.0,
										22.0
									],
									"id": "obj-3"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend port",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										400.0,
										70.0,
										98.0,
										22.0
									],
									"id": "obj-4"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 1",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-5"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 2",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										130.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-6"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 3",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										240.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-7"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "noteout 4",
									"numinlets": 3,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										350.0,
										140.0,
										75.0,
										22.0
									],
									"id": "obj-8"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "one MIDI channel per voice: 1 soprano, 2 alto, 3 tenor, 4 bass",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										180.0,
										440.0,
										20.0
									],
									"id": "obj-9"
								}
							}
						],
						"lines": [
							{
								"patchline": {
									"source": [
										"obj-1",
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
										"obj-4",
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
										"obj-5",
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
										"obj-4",
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
										"obj-3",
										2
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
										"obj-4",
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
										"obj-3",
										3
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
										"obj-4",
										0
									],
									"destination": [
										"obj-8",
										0
									]
								}
							}
						]
					},
					"patching_rect": [
						400.0,
						450.0,
						90.0,
						22.0
					],
					"id": "obj-82"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "p instruments",
					"numinlets": 2,
					"numoutlets": 0,
					"outlettype": [],
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
							160.0,
							160.0,
							760.0,
							460.0
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
									"maxclass": "inlet",
									"comment": "voice <n> <pitch> <velocity> (voice prefix removed)",
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
									"id": "obj-1"
								}
							},
							{
								"box": {
									"maxclass": "inlet",
									"comment": "plug <n> | open <n>",
									"index": 2,
									"numinlets": 0,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										420.0,
										20.0,
										30.0,
										30.0
									],
									"id": "obj-2"
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
										20.0,
										70.0,
										105.0,
										22.0
									],
									"id": "obj-3"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "route plug open",
									"numinlets": 2,
									"numoutlets": 3,
									"outlettype": [
										"",
										"",
										""
									],
									"patching_rect": [
										420.0,
										70.0,
										119.0,
										22.0
									],
									"id": "obj-4"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "sel 1 2 3 4",
									"numinlets": 1,
									"numoutlets": 5,
									"outlettype": [
										"bang",
										"bang",
										"bang",
										"bang",
										""
									],
									"patching_rect": [
										420.0,
										105.0,
										91.0,
										22.0
									],
									"id": "obj-5"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "sel 1 2 3 4",
									"numinlets": 1,
									"numoutlets": 5,
									"outlettype": [
										"bang",
										"bang",
										"bang",
										"bang",
										""
									],
									"patching_rect": [
										560.0,
										105.0,
										91.0,
										22.0
									],
									"id": "obj-6"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "dac~ 1 2",
									"numinlets": 2,
									"numoutlets": 0,
									"outlettype": [],
									"patching_rect": [
										20.0,
										330.0,
										60.0,
										22.0
									],
									"id": "obj-7"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-8"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										20.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-9"
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
										70.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-10"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										20.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-11"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										200.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-12"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										200.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-13"
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
										250.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-14"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										200.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-15"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										380.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-16"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										380.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-17"
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
										430.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-18"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										380.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-19"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "prepend midievent 144",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										560.0,
										150.0,
										140.0,
										22.0
									],
									"id": "obj-20"
								}
							},
							{
								"box": {
									"maxclass": "message",
									"text": "plug",
									"numinlets": 2,
									"numoutlets": 1,
									"outlettype": [
										""
									],
									"patching_rect": [
										560.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-21"
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
										610.0,
										185.0,
										40.0,
										22.0
									],
									"id": "obj-22"
								}
							},
							{
								"box": {
									"maxclass": "newobj",
									"text": "vst~ 2 2",
									"numinlets": 2,
									"numoutlets": 8,
									"outlettype": [
										"signal",
										"signal",
										"",
										"",
										"",
										"",
										"",
										""
									],
									"patching_rect": [
										560.0,
										230.0,
										60.0,
										22.0
									],
									"id": "obj-23"
								}
							},
							{
								"box": {
									"maxclass": "comment",
									"text": "plug: choose an AU/VST3 instrument for that voice; open: show its editor. Note-on with velocity 0 is note-off.",
									"numinlets": 1,
									"numoutlets": 0,
									"patching_rect": [
										20.0,
										270.0,
										700.0,
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
										"obj-1",
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
										"obj-3",
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
										"obj-11",
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
										"obj-9",
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
										"obj-10",
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
										"obj-11",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-11",
										1
									],
									"destination": [
										"obj-7",
										1
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
										"obj-12",
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
										"obj-5",
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
										"obj-6",
										1
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
										"obj-13",
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
										"obj-7",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-15",
										1
									],
									"destination": [
										"obj-7",
										1
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
										"obj-19",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										2
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
										"obj-6",
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
										"obj-17",
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
										"obj-7",
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
										"obj-7",
										1
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
										"obj-23",
										0
									]
								}
							},
							{
								"patchline": {
									"source": [
										"obj-5",
										3
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
										"obj-6",
										3
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
										"obj-21",
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
										"obj-7",
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
										"obj-7",
										1
									]
								}
							}
						]
					},
					"patching_rect": [
						400.0,
						670.0,
						100.0,
						22.0
					],
					"id": "obj-83"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "tosymbol",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						260.0,
						370.0,
						65.0,
						22.0
					],
					"id": "obj-84"
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
						20.0,
						470.0,
						91.0,
						22.0
					],
					"id": "obj-85"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "prepend set error:",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						150.0,
						470.0,
						120.0,
						22.0
					],
					"id": "obj-86"
				}
			},
			{
				"box": {
					"maxclass": "message",
					"text": "",
					"numinlets": 2,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						510.0,
						360.0,
						22.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						134.0,
						508.0,
						30.0
					],
					"id": "obj-87"
				}
			}
		],
		"lines": [
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
						"obj-11",
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
						"obj-13",
						1
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
						"obj-16",
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
						"obj-17",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-15",
						1
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
						"obj-17",
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
						"obj-18",
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
						"obj-16",
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
						"obj-19",
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
						"obj-28",
						1
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
						"obj-29",
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
						"obj-3",
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
						"obj-36",
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
						"obj-3",
						0
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
						"obj-42",
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
						"obj-39",
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
						"obj-44",
						0
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
						"obj-39",
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
						0
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
						"obj-49",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-49",
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
						"obj-48",
						1
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
						"obj-50",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-50",
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
						"obj-54",
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
						"obj-55",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-55",
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
						"obj-59",
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
						"obj-3",
						0
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
						"obj-68",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-69",
						0
					],
					"destination": [
						"obj-71",
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
						"obj-80",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-71",
						0
					],
					"destination": [
						"obj-81",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-80",
						0
					],
					"destination": [
						"obj-81",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-81",
						0
					],
					"destination": [
						"obj-82",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-81",
						1
					],
					"destination": [
						"obj-83",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-68",
						1
					],
					"destination": [
						"obj-84",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-84",
						0
					],
					"destination": [
						"obj-82",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-72",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-73",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-74",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-75",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-76",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-77",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-78",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-79",
						0
					],
					"destination": [
						"obj-83",
						1
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-80",
						1
					],
					"destination": [
						"obj-85",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-80",
						2
					],
					"destination": [
						"obj-86",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-85",
						0
					],
					"destination": [
						"obj-87",
						0
					]
				}
			},
			{
				"patchline": {
					"source": [
						"obj-86",
						0
					],
					"destination": [
						"obj-87",
						0
					]
				}
			}
		]
	}
}
