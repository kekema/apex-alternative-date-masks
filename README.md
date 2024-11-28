# apex-alternative-date-masks
Enables the user to enter dates as per one of the defined alternative masks.

Given a date format mask, this plugin enables to specify one or more alternative masks. Enabling the end-user alternative ways to enter a date. Upon entering a value in a date field, all masks are iterated till the entered date can be parsed successfully. Subsequently this parsed date will be formatted to the original date format mask for the field.
Suppose the date format mask for a field is 'MM/DD/YYYY' (as specified on the item or as the application date format mask). Then an alternative mask could be YYYYMMDD, so the date can also be entered then as eg 20241231 (mil format). See Plug-In Homepage for details.
