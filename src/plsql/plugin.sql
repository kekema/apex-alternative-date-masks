function render 
  ( p_dynamic_action in apex_plugin.t_dynamic_action
  , p_plugin         in apex_plugin.t_plugin )
return apex_plugin.t_dynamic_action_render_result
as

l_result     apex_plugin.t_dynamic_action_render_result;

begin
    if apex_application.g_debug then
        apex_plugin_util.debug_dynamic_action(p_plugin         => p_plugin,
                                              p_dynamic_action => p_dynamic_action);
    end if;    

    apex_javascript.add_library(
          p_name      => 'date-altmasks',
          p_check_to_add_minified => true,
          p_directory => p_plugin.file_prefix || 'js/',
          p_version   => NULL
    ); 

    l_result.javascript_function := 'lib4x.axt.date.alternativeMasks._define';
    l_result.ajax_identifier     := apex_plugin.get_ajax_identifier;
    l_result.attribute_01        := p_dynamic_action.attribute_01;
    l_result.attribute_02        := p_dynamic_action.attribute_02;
    l_result.attribute_03        := p_dynamic_action.attribute_03;
    l_result.attribute_04        := p_dynamic_action.attribute_04;
    l_result.attribute_05        := p_dynamic_action.attribute_05;
    l_result.attribute_06        := p_dynamic_action.attribute_06;
    l_result.attribute_07        := p_dynamic_action.attribute_07;
    l_result.attribute_08        := p_dynamic_action.attribute_08;
    l_result.attribute_09        := p_dynamic_action.attribute_09;
    l_result.attribute_10        := p_dynamic_action.attribute_10;    
    l_result.attribute_11        := p_dynamic_action.attribute_11;                             
    
    return l_result;
    
end render;
