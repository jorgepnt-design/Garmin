#!/usr/bin/env python3
"""Project structure checks only. This is NOT a Monkey C compilation."""
from pathlib import Path
import re
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
NS = {"iq": "http://www.garmin.com/xml/connectiq"}
ids = set()
faces = ("sport", "elegant", "tesla", "portugal")
for file in ROOT.rglob("*.xml"):
    if "build" not in file.parts:
        ET.parse(file)
for index, face in enumerate(faces):
    folder = ROOT / "faces" / face
    root = ET.parse(folder / "manifest.xml").getroot()
    app = root.find("iq:application", NS)
    assert app is not None and app.attrib["type"] == "watchface"
    uid = app.attrib["id"]
    assert re.fullmatch("[a-f0-9]{32}", uid) and uid not in ids
    ids.add(uid)
    products = app.findall("iq:products/iq:product", NS)
    assert [p.attrib["id"] for p in products] == ["venux1"]
    assert (folder / "monkey.jungle").is_file()
    props = ET.parse(folder / "resources" / "properties.xml").getroot()
    values = {p.attrib["id"]: p.text for p in props.findall(".//property")}
    assert values["Theme"] == str(index)
    assert values["AlarmTime"] == "--:--"
    resources = ET.parse(folder / "resources" / "strings.xml").getroot()
    assert resources.find("string[@id='AppName']") is not None
assert (ROOT / "shared/source/JorgeApp.mc").is_file()
assert (ROOT / "shared/source/JorgeFace.mc").is_file()
print("Four distinct manifests, resource XML, IDs, themes and device targets validated.")
print("Monkey C compilation and simulator/device checks have NOT been performed by this check.")
