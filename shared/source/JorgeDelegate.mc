import Toybox.WatchUi;
import Toybox.Complications;

// Garmin invokes onPress after holding a complication, not a short tap.
class JorgeDelegate extends WatchUi.WatchFaceDelegate {
    var face;
    function initialize(view) { WatchFaceDelegate.initialize(); face = view; }
    function onPress(event) {
        if (face.sleeping || face.width == 0) { return false; }
        var point = event.getCoordinates();
        var x = point[0] * 448.0 / face.width;
        var y = point[1] * 486.0 / face.height;
        var type = null;
        if (y >= 325 && y <= 460) {
            if (x >= 22 && x < 153) { type = Complications.COMPLICATION_TYPE_CURRENT_WEATHER; }
            else if (x >= 153 && x < 295) { type = Complications.COMPLICATION_TYPE_STEPS; }
            // No public next-alarm complication: never launch an unrelated app.
        } else if (y >= 35 && y < 125 && x >= 320) {
            type = Complications.COMPLICATION_TYPE_BATTERY;
        }
        if (type == null) { return false; }
        try { Complications.exitTo(new Complications.Id(type)); return true; }
        catch (e) { return false; }
    }
}
