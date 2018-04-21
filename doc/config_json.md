# Configuration JSON File Template

```json
{"configuration": {[a]
  "vacationMode": "V",
 "waterStartHour": "W",
 "waterPeriod": "X",
  "useMiracleGro": "Y",
 "moistureLowerBound": "Z"
}}
```

Note[b]
* V: Vacation mode on or not
   * Type: Boolean
   * Valid Value: 0 or 1
   * Comment: This has not been implemented
* W: The hour of the first watering schedule of a day
   * Type: Integer
   * Valid Value: 0-23 (inclusive)
   * Comment: This should be the hour of the very first watering schedule of a
     day. If the value sending in can have another watering schedule earlier,
     the planter software will automatically update this value. (e.g. W = 15
     and X = 6, the very first watering schedule should be 3am instead of 15.
     Planter program will update W to 3)
* X: Water the plant every X hours
   * Type: Integer
   * Valid Value: 1, 2, 3, 4, 6, 8, 12
* Y: Fertilize or not (weekly)
   * Type: Boolean
   * Valid Value: 0 or 1
* Z: Water the plant when the moisture of soil drops below Z% and watering is
  scheduled
   * Type: Integer
   * Valid Value: 1-100 (inclusive)
* If a planter does not receive a configuration file, it will use default
  settings. (V = 0, W = 0, X = 8, Y = 1, Z = 40)

## Examples

### Example 1
```json
{"configuration": {
  "vacationMode": "0",
 "waterStartHour": "6",
 "waterPeriod": "8",
  "useMiracleGro": "1",
 "moistureLowerBound": "40"
}}
```

* Watering is scheduled at 6am, 2pm, 10pm everyday
* Water the plant until moisture reaches 40% (Don’t water if moisture is higher
  than the lower bound)
* Use miracle gro once a week

### Example 2

```json
{"configuration": {
  "vacationMode": "1",
 "waterStartHour": "14",
 "waterPeriod": "6",
  "useMiracleGro": "0",
 "moistureLowerBound": "50"
}}
```

* Watering is scheduled at 2am, 8am, 2pm, 8pm everyday
* Water the plant until moisture reaches 50% (Don’t water if moisture is higher
  than the lower bound).
* Moisture lower bound might be adjusted to a lower value if the water level is
  low. (Vacation Mode)
* Don’t use miracle gro

## Considerations

* [a] Do we need to store device info such as MAC address? Or we can just
   assume the server will always send the configuration file to the correct
   device.
* [b] Anything else needs to be configured?
