window.lib4x = window.lib4x || {};
window.lib4x.axt = window.lib4x.axt || {};
window.lib4x.axt.date = window.lib4x.axt.date || {};

/*
 * Javascript as to support processing alternative date masks in case of date value change.
 * So if the entered date value can not be parsed as per the regular format mask, it will
 * check the alternatives one by one until any successfull parse. Upon successfull parse,
 * it will take the native date and format to the target format mask. In case of no successfull
 * parse, it will leave the input value as is, upon which the user will see the feedback once
 * validation executes.
 * 
 * Terminology
 * A date format is used for output
 * A date mask is used for input 
 * APEX defines date format masks for the purpose (input/output)
 */
lib4x.axt.date.alternativeMasks = (function($)
{
    // array of masks by target format mask
    // eg altMasks['DS'] = ['DS', 'MM-DD-YYYY', 'MMDDYYYY', 'MMDDYY']
    let altMasks = {};
    let dialogGeneratedDatesSupport = true;

    // define function called from DA
    // takes the DA attributes and defines entry in altMasks
    let define = function()
    {
        let daThis = this;
        let targetFormatMask = daThis.action.attribute01;
        let masksArray = [];
        masksArray.push(targetFormatMask);
        for (let attrIndex = 2; attrIndex <= 11; attrIndex++)   // max 10 alternatives
        {
            let mask = daThis.action['attribute' + (attrIndex.toString()).padStart(2, '0')];
            if (mask)
            {
                masksArray.push(mask);
            }
        }
        altMasks[targetFormatMask] = masksArray; 
    };

    // in case of some unexpected issue with support for dynamically generated dates,
    // by this method the support can be disabled 
    let disableDialogGeneratedDatesSupport = function()
    {
        dialogGeneratedDatesSupport = false;
    }

    // get dateFormat as defined for a date element
    // which is by default the application date format mask
    function getDateFormat(element$)
    {
        let dateFormat = element$.attr('format');  // regular attribute!
        // fallback on the application date format mask in case not found
        if (!dateFormat)
        {
            dateFormat = apex.locale.getDateFormat();
        } 
        return dateFormat;               
    }  

    let dateChangeHandler = function(e)
    {
        // alt masks check is applicable in case of date picker display as 'popup' (so not for 'inline' / 'Native HTML')
        if($(e.target).parent().hasClass("apex-item-datepicker--popup")) 
        {
            let targetFormatMask = getDateFormat($(e.target).parent());
            if (targetFormatMask && altMasks.hasOwnProperty(targetFormatMask))
            {
                let masksArray = altMasks[targetFormatMask];
                let dateStringValue = $(e.target).val();
                if (dateStringValue)
                {
                    apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler');
                    apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: element:', e.target.id);
                    apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: dateStringValue:', dateStringValue);
                    apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: targetFormatMask:', targetFormatMask);
                    apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: masksArray:', masksArray);
                    let parsedDate = null;
                    let dateOk = false;
                    let masksIndex = 0;
                    let dateMask = masksArray[masksIndex];
                    // iterate all masks until any successfull parse
                    while ((masksIndex < masksArray.length) && !dateOk)
                    {
                        try 
                        {
                            if (dateMask == 'DD')
                            {
                                parsedDate = new Date();
                                let currentMonth = parsedDate.getMonth();
                                let currentYear = parsedDate.getFullYear();
                                let setResult = parsedDate.setDate(dateStringValue);   // set day
                                if (isNaN(setResult) || (parsedDate.getMonth() != currentMonth) || (parsedDate.getFullYear() != currentYear))
                                {
                                    throw new Error('Entered value is not a valid day');
                                }
                                dateOk = true;
                            } 
                            else if ((dateMask == 'DD/MM') || (dateMask == 'MM/DD') || (dateMask == 'DD-MM') || (dateMask == 'MM-DD') || (dateMask == 'DD.MM') || (dateMask == 'MM.DD'))
                            {
                                let currentYear = new Date().getFullYear();
                                // whatever the separator, the below with adding using '/' just works 
                                parsedDate = apex.date.parse(dateStringValue + '/' + currentYear, dateMask + '/YYYY');
                                dateOk = true;
                            }  
                            else
                            {                         
                                parsedDate = apex.date.parse(dateStringValue, dateMask);
                                dateOk = true;
                            }
                            if (dateOk)
                            {
                                apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: parse success - dateMask:', dateMask);
                            }
                        }
                        catch (e) 
                        {
                            dateOk = false;
                            masksIndex++;
                            dateMask = masksArray[masksIndex];
                        }
                    }
                    if (dateOk && parsedDate)
                    {
                        // successfully parsed - now format to the target format mask
                        // intentionally also when maskIndex == 0 as a date like 
                        // 0811-2023 gets successfully parsed with mask 'DS' but then the
                        // formattedValue will be 8/01/2023
                        let formattedValue = apex.date.format(parsedDate, targetFormatMask);
                        apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: formattedValue:', formattedValue);
                        $(e.target).val(formattedValue);
                    }
                    if (!dateOk)
                    {
                        apex.debug.trace('lib4x.axt.date.alternativeMasks.dateChangeHandler: no parse success');
                        // if no successfull parse, leave input value as is 
                        // (will give error feedback on validation)
                    }
                }
            }
        }
    };  

    // prioritize our dateChangeHandler
    function prioritizeChangeHandler(element)
    {
        // http://www.robeesworld.com/blog/67/changing-the-order-of-the-jquery-event-queue
        let eventList = $._data(element, "events");
        // to be sure, check if the last handler is our dateChangeHandler
        if (eventList?.change && eventList.change.length && (eventList.change[eventList.change.length-1].handler === dateChangeHandler))
        {
            // take out last one and put as first one
            eventList.change.unshift(eventList.change.pop());
        }        
    }

    // on document load complete, set up change event handler
    // for .apex-item-datepicker elements
    $(function(){
        // put change event handler on the wrapped input element
        $('.apex-item-datepicker').on('change.lib4xAltMasks', dateChangeHandler);
        $('.apex-item-datepicker').each(function(){
            prioritizeChangeHandler(this);
            $(this).data('lib4xAltMasksHandlerAttached', true);
        });

        // APEX is using dialogs like Report Filters in which date fields are 
        // dynamically generated. To enable the alterative masks also here, we 
        // attach our change handler on first focusin.
        apex.gPageContext$.on('dialogopen', function(jQueryEvent, data) {
            if (dialogGeneratedDatesSupport)
            {
                $(jQueryEvent.target).off('focus.lib4xAltMasks');
                $(jQueryEvent.target).on('focus.lib4xAltMasks', '.apex-item-datepicker', function(){
                    if (!$(this).data('lib4xAltMasksHandlerAttached'))
                    {
                        $(this).off('change.lib4xAltMasks');   // to be sure                   
                        $(this).on('change.lib4xAltMasks', dateChangeHandler);
                        prioritizeChangeHandler(this);     
                        $(this).data('lib4xAltMasksHandlerAttached', true);
                    }
                });
            }
        });          
    });

    return{
        _define: define,
        disableDialogGeneratedDatesSupport: disableDialogGeneratedDatesSupport
    }
})(apex.jQuery);  
