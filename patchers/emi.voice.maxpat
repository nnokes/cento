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
			700.0,
			420.0
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
					"text": "emi.voice: plays one voice from emi.brain on this track",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						20.0,
						5.0,
						420.0,
						20.0
					],
					"id": "obj-1"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "EMI voice",
					"numinlets": 1,
					"numoutlets": 0,
					"fontface": 1,
					"patching_rect": [
						20.0,
						40.0,
						80.0,
						20.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						4.0,
						100.0,
						20.0
					],
					"id": "obj-2"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "live.thisdevice",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"bang",
						"int",
						"int"
					],
					"patching_rect": [
						20.0,
						70.0,
						119.0,
						22.0
					],
					"id": "obj-3"
				}
			},
			{
				"box": {
					"maxclass": "live.menu",
					"numinlets": 1,
					"numoutlets": 3,
					"outlettype": [
						"",
						"",
						"float"
					],
					"parameter_enable": 1,
					"varname": "Voice",
					"saved_attribute_attributes": {
						"valueof": {
							"parameter_enum": [
								"Soprano",
								"Alto",
								"Tenor",
								"Bass"
							],
							"parameter_initial": [
								0
							],
							"parameter_initial_enable": 1,
							"parameter_longname": "Voice",
							"parameter_mmax": 3,
							"parameter_shortname": "Voice",
							"parameter_type": 2
						}
					},
					"patching_rect": [
						20.0,
						110.0,
						100.0,
						15.0
					],
					"presentation": 1,
					"presentation_rect": [
						6.0,
						30.0,
						100.0,
						15.0
					],
					"id": "obj-4"
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
						20.0,
						145.0,
						40.0,
						22.0
					],
					"id": "obj-5"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "sprintf set emi.voice.%ld",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						180.0,
						189.0,
						22.0
					],
					"id": "obj-6"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "receive",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						""
					],
					"patching_rect": [
						20.0,
						215.0,
						55.0,
						22.0
					],
					"id": "obj-7"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "no name typed in: only an unnamed [receive] has an inlet for set",
					"numinlets": 1,
					"numoutlets": 0,
					"patching_rect": [
						90.0,
						215.0,
						300.0,
						20.0
					],
					"id": "obj-8"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiformat",
					"numinlets": 7,
					"numoutlets": 2,
					"outlettype": [
						"int",
						""
					],
					"patching_rect": [
						20.0,
						250.0,
						75.0,
						22.0
					],
					"id": "obj-9"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiin",
					"numinlets": 1,
					"numoutlets": 1,
					"outlettype": [
						"int"
					],
					"patching_rect": [
						200.0,
						215.0,
						50.0,
						22.0
					],
					"id": "obj-10"
				}
			},
			{
				"box": {
					"maxclass": "newobj",
					"text": "midiout",
					"numinlets": 1,
					"numoutlets": 0,
					"outlettype": [],
					"patching_rect": [
						100.0,
						290.0,
						55.0,
						22.0
					],
					"id": "obj-11"
				}
			},
			{
				"box": {
					"maxclass": "comment",
					"text": "pitch velocity from emi.brain -> this track's instrument; track MIDI passes through",
					"numinlets": 1,
					"numoutlets": 0,
					"linecount": 2,
					"patching_rect": [
						200.0,
						250.0,
						330.0,
						34.0
					],
					"id": "obj-12"
				}
			}
		],
		"lines": [
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
			}
		]
	}
}
