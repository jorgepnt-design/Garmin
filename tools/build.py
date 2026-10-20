#!/usr/bin/env python3
"""Build all four PRGs with an installed official Garmin Connect IQ SDK."""
import argparse
import os
from pathlib import Path
import shutil
import subprocess
import sys
import re

ROOT = Path(__file__).resolve().parents[1]
FACES = ("sport", "elegant", "tesla", "portugal")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--sdk", default=os.environ.get("CIQ_SDK_HOME"))
    parser.add_argument("--key", required=True, help="Local developer_key.der; never commit it")
    parser.add_argument("--alarm", help="Optional manually displayed time, HH:MM; does not set an alarm")
    args = parser.parse_args()
    key = Path(args.key).expanduser().resolve()
    if not key.is_file():
        parser.error("Developer key not found.")
    if args.alarm and not re.fullmatch(r"(?:[01][0-9]|2[0-3]):[0-5][0-9]", args.alarm):
        parser.error("--alarm must be a valid 24-hour HH:MM time.")
    executable = "monkeyc.bat" if os.name == "nt" else "monkeyc"
    compiler = Path(args.sdk).expanduser() / "bin" / executable if args.sdk else None
    if compiler is None:
        detected = shutil.which(executable)
        if not detected:
            parser.error("Install Garmin SDK + Venu X1 profile, then pass --sdk or set CIQ_SDK_HOME.")
        compiler = Path(detected)
    if not compiler.is_file():
        parser.error("monkeyc compiler not found in SDK/bin.")
    output = ROOT / "build"
    output.mkdir(exist_ok=True)
    for face in FACES:
        # Stage per build; optional alarm never mutates repository source.
        stage = output / "staging" / face
        if stage.exists():
            shutil.rmtree(stage)
        shutil.copytree(ROOT / "shared", stage / "shared")
        shutil.copytree(ROOT / "faces" / face, stage / "faces" / face)
        if args.alarm:
            props = stage / "faces" / face / "resources" / "properties.xml"
            props.write_text(props.read_text(encoding="utf-8").replace("--:--", args.alarm), encoding="utf-8")
        project = stage / "faces" / face
        destination = output / ("Jorge-" + face + ".prg")
        # Remove any stale output before starting, so failure cannot look successful.
        destination.unlink(missing_ok=True)
        command = [str(compiler.resolve()), "-f", "monkey.jungle",
                   "-d", "venux1", "-y", str(key), "-o", str(destination), "-w"]
        print("Building " + face, flush=True)
        if os.name == "nt":
            command = ["cmd", "/c"] + command
        subprocess.run(command, cwd=project, check=True)
        if not destination.is_file() or destination.stat().st_size == 0:
            raise RuntimeError("No PRG generated: " + face)
    print("All four compiled successfully. Real-device verification is still required.")

if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.exit(exc.returncode)
