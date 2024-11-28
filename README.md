# apex-alternative-date-masks
Enables the user to enter dates as per one of a list of defined alternative masks

Given a date format mask, this plugin enables to specify one or more alternative masks. Enabling the end-user alternative ways to enter a date. Upon entering a value in a date field, all masks are iterated till the entered date can be parsed successfully. Subsequently this parsed date will be formatted to the original date format mask for the field. The parsing and formatting is as per [apex.date](https://docs.oracle.com/en/database/oracle/apex/24.1/aexjs/apex.date.html).

Suppose the date format mask for a field is 'MM/DD/YYYY' (as specified on the item or as the application date format mask). Then an alternative mask could be YYYYMMDD, so the date can also be entered then as eg 20241231 (mil format). 

In case the input value can not be parsed as per any of all the masks, the input value is left untouched. The feedback to the user will be upon validation in the page, resulting in an invalid date error message.

The plugin functionality is applied to the input field of APEX Date Picker items (Display As 'Popup'). Also date fields in APEX dialogs (like the Actions/Filters dialog in reports) do have automatically the functionality attached (can be disabled).

To define the alternative masks, add a Dynamic Action On Page Load. This can also be on page 0 as to define for the whole application. In the true action, select 'LIB4X - Alternative Date Masks [Plug-In]':

![image](https://github.com/kekema/apex-alternative-date-masks/blob/main/alternative-date-masks-definition.jpg)

In case the application uses multiple date format masks for which you want to define alternative masks, simply add multiple true actions to the DA.

See: [demo page](https://apex.oracle.com/pls/apex/r/yola/demo/alternative-date-masks)

![image](https://github.com/kekema/apex-alternative-date-masks/blob/main/alternative-date-masks-demo.jpg)
