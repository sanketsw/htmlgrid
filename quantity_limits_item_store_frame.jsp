<%@page import="com.retek.alloc.db.*" %>
<%@page import="com.retek.alloc.utils.*" %>
<%@page import="com.retek.alloc.business.*" %>
<%@page import="com.retek.alloc.business.itemsourcelocation.*" %>
<%@page import="com.retek.alloc.foundation.*" %>
<%@page import="com.retek.alloc.ui.*" %>
<%@page import="java.util.*" %>

<%@include file="login_header.jspf" %>
<%@include file="quantity_limits_functions.jspf" %>
<%@include file="moveable_header.jspf" %>
<%@page errorPage="alloc_errorpage.jsp" %>


<%@taglib uri="/WEB-INF/ssptags.tld" prefix="ssp" %>
<%@taglib uri="/WEB-INF/alloctags.tld" prefix="alloc" %>
<%@taglib uri="/WEB-INF/i18n.tld" prefix="i18n"%>

<i18n:bundle baseName="com.retek.alloc.allocation_gui"/>

<html>
<head>
<link rel="stylesheet" href="htmlgrid.css" />
<%
 // since we dont include header.jsp here
 response.addHeader("Pragma", "No-cache");
 response.addHeader("Cache-Control", "no-cache"); 
 response.addDateHeader("Expires", 1);
 
 //Get another Resource bundle to pick up strings from allocation_strings
 java.util.ResourceBundle  rb1 = I18NUtility.getRB();  
%>

<meta http-equiv="Content-Type" content="text/html; charset=<i18n:message key="BrowserSetting.charset"/>">

</head>
<SCRIPT LANGUAGE="JavaScript" TYPE="text/javascript">
<!--
function onClickNavigate(pageNum)
{
	document.forms[0].controllerAction.value = "navigateToNewPage";
	document.forms[0].USERENV_currentPosition.value = pageNum;
	document.forms[0].submit();
	return false;
}
function editAction(element)
{
// window.parent.document.quantity_limits.productLevel.disabled=true;
//  window.parent.document.quantity_limits.locType.disabled=true;
}
-->
</script>

<body onLoad="actionOnLoad();" class=gList marginwidth="0" marginheight="0" leftmargin="0" rightmargin="0" topmargin="0">

<ssp:dynamicStyleSheet userId="<%= login.getUserId() %>" />
<%
    Vector qlVector = alloc.getQuantityLimitsList().getItemStoreVector();
%>
<div id="tbl-container">
<table id="tbl" width="100%" cellspacing="0" cellpadding="0">
<form name="quantity_limits_item_store_frame" method=post action="ScreenController">
    <input type="hidden" name="controllerAction" value="apply">
    <input type="hidden" name="productLevelSwitch" value="">
    <input type="hidden" name="locationTypeSwitch" value="">
    <input type="hidden" name="quantityLimitsType" value="<%=QuantityLimitsList.ITEM_STORE_STR%>">
    <input type="hidden" name="alternateProductLevel" value="">

    <i18n:message id="header"  key="Heading.quantity_limit_item_store"/>

	<%
		String disableColumns = "no,no,no,no,no,no,no,no,no";
		if (alloc.getRule().isCascade() && alloc.getItemSourceList().getAAlcItemSourceList().hasSameItemWithMultipleReleaseDates(alloc.isMldAllocation()))
		{
			disableColumns = "no,no,no,yes,yes,yes,yes,yes,yes";
		}
		else if (alloc.getRule().isCascade())
		{
			disableColumns = "no,no,no,no,no,yes,yes,yes,yes";
		}	
		else if (alloc.getRule().getRuleType().equals(Rule.TYPE_PLAN_REPROJECT) && alloc.getItemSourceList().getAAlcItemSourceList().hasSameItemWithMultipleReleaseDates(alloc.isMldAllocation()))
		{
			disableColumns = "no,no,no,yes,yes,yes,no,yes,no";
		}
		else if (alloc.getRule().getRuleType().equals(Rule.TYPE_PLAN_REPROJECT))
		{
			disableColumns = "no,no,no,no,no,no,no,yes,no";
		}
		else if (alloc.getItemSourceList().getAAlcItemSourceList().hasSameItemWithMultipleReleaseDates(alloc.isMldAllocation()))
		{
			disableColumns = "no,no,no,yes,yes,yes,no,no,no";
		}
	%>

    <alloc:quantityLimitsItemStoreFrame name="ql_list" formName="quantity_limits_item_store_frame" collection="<%= qlVector %>"
                   primaryKeyColumn="itemIdAndLocationId"
                   columns="itemIdAndDesc,locationIdAndDesc,groupDesc,displayMin,displayMax,displayThreshold,displayTrend,displayWos,displayMinNeed"
                   columnTypes="string,string,string,string,string,string,string,string,string"
                   editableColumns='<%=alloc.isEditable() ? "no,no,no,yes,yes,yes,yes,yes,yes" : "no,no,no,no,no,no,no,no,no"  %>'
                   disableColumns='<%= disableColumns %>'
                   sortableColumns="yes,yes,yes,yes,yes,yes,yes,yes,yes"
                   filterableColumns="yes,yes,yes,no,no,no,no,no,no"
                   defaultSortColumn="itemIdAndDesc"
                   alignment="left,left,left,left,left,left,left,left,left"
                   columnHeadings="<%= header %>" />

<input name="inventoryMin" type="hidden" value="">
<input name="inventoryMax" type="hidden" value="">

</form>
</table>
</div>
<script src="jquery.min.js"></script>
<script type="text/javascript" src="htmlgrid_qtyl.js"></script>
</body>
</html>


<%@include file="login_footer.jspf" %>

<%if(request.getParameter("max_proportional_msg") != null && request.getParameter("max_proportional_msg").startsWith("true"))
  { %>         
   <script language="JavaScript">  
       enableButtons();
        alert('<%=rb1.getString("QuantityLimits.ProductMaxInvalid")+" "+request.getParameter("itemId")+" "+rb1.getString("QuantityLimits.PostMaxInvalid")%>');
       selectProductLevel(0);
   </script>
   
<%}%> 

<% 
  if(request.getParameter("min_avail_msg") != null && request.getParameter("min_avail_msg").startsWith("true"))
  { %>         
   <script language="JavaScript"> 
       enableButtons();
    	alert('<%=rb1.getString("QuantityLimits.ProductMinInvalid")+" "+request.getParameter("itemId")+" "+rb1.getString("QuantityLimits.PostMinInvalid")%>');
       selectProductLevel(0);
   </script>
   
<% }

else if(request.getParameter("close") != null && request.getParameter("close").startsWith("true"))
{%>
<script language="JavaScript">
     window.parent.document.location.href = 'rules.jsp';
</script>
<% } %>
