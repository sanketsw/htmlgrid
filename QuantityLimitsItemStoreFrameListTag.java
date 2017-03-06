/*
 * Created on Jun 4, 2004
 *
 * To change the template for this generated file go to
 * Window - Preferences - Java - Code Generation - Code and Comments
 */
package com.retek.alloc.tags;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.math.NumberUtils;

import com.retek.alloc.business.QuantityLimits;
import com.retek.alloc.ui.ColumnList;
import com.retek.alloc.utils.Utility;

/**
 * @author zzvelar
 * 
 * To change the template for this generated type comment go to Window - Preferences - Java - Code
 * Generation - Code and Comments
 */
public class QuantityLimitsItemStoreFrameListTag extends QuantityLimitsListTag
{
    private static final long serialVersionUID = -5048807352138172683L;

    /*
     * (non-Javadoc)
     * 
     * @see com.retek.alloc.tags.ListTag#generateHtml(javax.servlet.http.HttpServletRequest)
     */
    protected String generateHtml(HttpServletRequest request)
    {
        System.out.println("generateHtml=" );
        StringBuffer headerOut = new StringBuffer();
        String orderBy = request.getParameter("orderBy") == null ? defaultSortColumn : request
                .getParameter("orderBy");
        String direction = request.getParameter("direction") == null ? "ASC" : request
                .getParameter("direction");
        String directionChange = direction.equals("ASC") ? "DESC" : "ASC";
        String whichImage = direction.equals("ASC") ? "images/sort_up.gif" : "images/sort_dn.gif";
        String filters[] = new String[columns.length];
        String cachedFilters[] = new String[columns.length];
        String currentPosition = request.getParameter("USERENV_currentPosition");
        if (currentPosition == null)
        {
            currentPosition = "0";
        }
        String previousPosition = request.getParameter("previousPosition");
        String itemFilterValue = Utility.getUTF8DecodedValue(request.getParameter("itemIdAndDesc"));
        String storeFilterValue = Utility.getUTF8DecodedValue(request.getParameter("groupDesc"));
        String setAll = request.getParameter("setAll");
        String referer = request.getRequestURI();
        referer = referer.substring(referer.lastIndexOf("/") + 1);
        if (referer.indexOf("?") > -1)
        {
            referer = referer.substring(0, referer.indexOf("?"));
        }
        referer = referer.toLowerCase();
        ColumnList colList = null;
        String[] newOrderColumns = new String[columns.length];
        String[] newOrderColumnHeadings = new String[columnHeadings.length];
        String[] newOrderColumnTypes = new String[columns.length];
        boolean[] newOrderColumnEditable = new boolean[columns.length];
        boolean[] newOrderColumnDisable = new boolean[columns.length];
        boolean[] newOrderColumnSort = new boolean[columns.length];
        boolean[] newOrderColumnFilter = new boolean[columns.length];
        newOrderColumns = columns;
        newOrderColumnTypes = columnTypes;
        newOrderColumnEditable = columnEditable;
        newOrderColumnDisable = columnDisable;
        newOrderColumnSort = columnShowSort;
        newOrderColumnFilter = columnShowFilter;
        newOrderColumnHeadings = columnHeadings;

        for (int i = 0; i < newOrderColumns.length; i++)
        {
            filters[i] = Utility.getUTF8DecodedValue(request.getParameter(newOrderColumns[i]));
            cachedFilters[i] = (String) request.getSession().getAttribute(newOrderColumns[i]);
            if (filters[i] == null || filters[i].trim().length() == 0)
            {
                filters[i] = null;
            }
        }
        boolean isAnyColumnEditable = isAnyColumnEditable();
        if (isAnyColumnEditable)
        {
            headerOut.append("<input type=\"hidden\" name=\"primaryKeyColumn\" value=\""
                    + primaryKeyColumn + "\">\n");
            String editableColumns = "";
            for (int i = 0; i < newOrderColumns.length; i++)
            {
                if (newOrderColumnEditable[i])
                {
                    editableColumns += (editableColumns.length() > 0 ? "," : "")
                            + newOrderColumns[i];
                }
            }
            headerOut.append("<input type=\"hidden\" name=\"editableColumns\" value=\""
                    + editableColumns + "\">\n");
        }
        headerOut.append("<INPUT type=hidden NAME=USERENV_currentPosition VALUE=").append(
                currentPosition).append(">");
        headerOut.append("<INPUT type=hidden NAME=orderBy VALUE=").append(orderBy).append(">");
        headerOut.append("<INPUT type=hidden NAME=direction VALUE=").append(direction).append(">");

        // headerOut.append(generateHeader(referer, newOrderColumnHeadings, newOrderColumns,
        // newOrderColumnSort, filters, directionChange, whichImage, orderBy, direction));

        headerOut.append("<table width=\"100%\" cellspacing=\"0\" class=\"htmlgrid-table htmlgrid-table-header\">\n");
        // Generate header
        headerOut.append("<thead class=\"fixedHeader\">\n");
        headerOut.append("<tr id=\"gMoveableTableHeader\" class=\"gMoveableTableHeader\" >");
        headerOut.append("<th width=\"3%\" valign=\"bottom\" align=\"center\"> # </th>");
        for (int i = 0; i < newOrderColumnHeadings.length; i++)
        {
            String columnName = newOrderColumns[i];
            String width = getColumnWidth(columnName);
            headerOut.append("<th width=\""+width +"\" valign=\"bottom\" align=\"" + alignment[i] + "\">");
            if (newOrderColumnSort[i])
            {
                if (orderBy.equals(newOrderColumns[i]))
                {
                    headerOut.append("<a href=\""
                            + buildUrlFromColumnList(referer, i, newOrderColumns, directionChange,
                                    filters) + "\"><b>" + newOrderColumnHeadings[i] + "</b></a>");
                    headerOut.append("<img src=\"" + whichImage + "\" border=0>");
                }
                else
                {
                    headerOut.append("<a href=\""
                            + buildUrlFromColumnList(referer, i, newOrderColumns, direction,
                                    filters) + "\"><b>" + newOrderColumnHeadings[i] + "</b></a>");
                }
            }
            else
            {
                headerOut.append("<b>" + newOrderColumnHeadings[i] + "</b>");
                if (newOrderColumnHeadings[i].equalsIgnoreCase("Final")
                        && referer.indexOf("details_store_frame.jsp") > -1)
                {
                    headerOut
                            .append("<br><input size=\"3\" maxlength=\"6\" class=\"gList\" type=\"text\" name=\"setAll\" value=\"\"><input class=\"gButton\" name=\"setAllButton\" value=\""
                                    + Utility.getResourceBundleForAllocationGui().getString(
                                            "Button.set_all")
                                    + "\" type=\"button\" onClick=\"javascript:setAllFinalValues();\">");
                }
            }
            headerOut.append("</th>");
        }
        headerOut.append("</tr>\n");
        headerOut.append("</thead>\n");
        StringBuffer out = new StringBuffer();
        StringBuffer primaryKeys = new StringBuffer();
        // Use the list of locations to include if they exist and match the
        // current
        // filter and sort criteria.
        // The query is ordered by location id and description, default the
        // cached order by
        // parameter to locationIdAndDesc so the code can determine if a sort is
        // needed
        // or if the sort can initially be skipped.
        String cachedOrderBy = request.getSession().getAttribute("cachedOrderBy") == null ? "locationIdAndDesc"
                : (String) request.getSession().getAttribute("cachedOrderBy");
        String cachedDirection = request.getSession().getAttribute("cachedDirection") == null ? "ASC"
                : (String) request.getSession().getAttribute("cachedDirection");
        boolean filterValuesEqualCachedFitlerValues = true;
        for (int i = 0; i < newOrderColumns.length; i++)
        {
            // if (!Utility.equals(filters[i], cachedFilters[i])) {
            filterValuesEqualCachedFitlerValues = false;
            if (filters[i] == null || filters[i].length() == 0)
            {
                request.getSession().removeAttribute(newOrderColumns[i]);
            }
            else
            {
                request.getSession().setAttribute(newOrderColumns[i], filters[i]);
            }
            // }
        }
        Map[] filterMaps = (Map[]) request.getSession().getAttribute("cachedFilterMaps");
        List sortedLocationsToInclude = null;
        if (Utility.equals(orderBy, cachedOrderBy) && Utility.equals(direction, cachedDirection)
                && filterValuesEqualCachedFitlerValues)
        {
            sortedLocationsToInclude = (List) request.getSession().getAttribute(
                    "cachedQtyLimitItemStoreList");
        }
        if (sortedLocationsToInclude == null)
        {
            filterMaps = new TreeMap[columns.length];
            for (int i = 0; i < newOrderColumns.length; i++)
            {
                if (newOrderColumns[i].equalsIgnoreCase("locationIdAndDesc"))
                {
                    filterMaps[i] = new TreeMap(new QuantityLimitsByLocationIdComparator());
                }
                else
                {
                    filterMaps[i] = new TreeMap();
                }
            }     
            System.out.println("QuantityLimitListGenerator=" + orderBy + direction);
            ListGenerator listGenerator = new QuantityLimitListGenerator(newOrderColumns,
                    newOrderColumnTypes, newOrderColumnFilter, filterMaps, filters, direction,
                    orderBy, cachedDirection, cachedOrderBy, filterValuesEqualCachedFitlerValues,
                    collect);
            sortedLocationsToInclude = listGenerator.generateList();
            request.getSession().setAttribute("cachedQtyLimitItemStoreList",
                    sortedLocationsToInclude);
            request.getSession().setAttribute("cachedOrderBy", orderBy);
            request.getSession().setAttribute("cachedDirection", direction);
            request.getSession().setAttribute("cachedFilterMaps", filterMaps);
        }
        int totalRows = sortedLocationsToInclude.size();
        int firstItemToInclude = Integer.parseInt(currentPosition);
        
        // Calculate initial summary totals
        Map totalMap = new HashMap();
        Iterator iter = collect.iterator();
        while (iter.hasNext())
        {
            QuantityLimits o = (QuantityLimits) (iter.next());
            for (int i = 0; i < columns.length; i++) {
                System.out.print(" col=" + i);
                if (columnEditable[i]) {
                    System.out.print(" editable=true");
                    Object value = getPropertyValue(o, columns[i]);
                    System.out.print(" value=" + value);
                    if(NumberUtils.isNumber((String) value)) {
                        System.out.print(" number=" + value);
                        double valueDouble = Double.parseDouble((String) value);
                        Double total = (Double) totalMap.get(columns[i]);
                        if(total == null) {
                            total = new Double(0);
                        }
                        System.out.print(" total=" + total);
                        totalMap.put(columns[i], new Double(total.doubleValue() + valueDouble));
                    }
                }
                System.out.print("\n");
            }
        }
        System.out.println("Done.");
        StringBuffer footerOut = new StringBuffer();
        footerOut.append("<table width=\"100%\" cellspacing=\"0\" class=\"htmlgrid-table htmlgrid-table-footer\">\n");
        footerOut.append("<tfoot>");
        footerOut.append("<tr>");
        footerOut.append("<td width=\"3%\" valign=\"bottom\" align=\"center\"> </th>");
        for (int i = 0; i < columns.length; i++) {
            footerOut.append("<td align=\"left\" width=\""+ getColumnWidth(columns[i]) +"\" id=\"Total_"+ columns[i] +"\">");
            Object value = totalMap.get(columns[i]);
            if(value != null) {
                footerOut.append(value);
            } else {
                footerOut.append("0");
            }
            footerOut.append("</td>");
        }
        footerOut.append("</tr> \n </tfoot> \n </table>");
        

        out.append("<div class=\"htmlgrid-div\">\n");
        out.append("<table width=\"100%\" cellspacing=\"0\" class=\"htmlgrid-table htmlgrid-table-body\">\n");
        int rowNum = 0;
        while (rowNum < recordsPerPage && rowNum + firstItemToInclude < totalRows)
        {
            QuantityLimits o = (QuantityLimits) sortedLocationsToInclude.get(rowNum
                    + firstItemToInclude);
            String currentItemIdAndDesc = null;
            String currentGroupDesc = null;
            QuantityLimits ql = (QuantityLimits) o;
            currentItemIdAndDesc = ql.getItemIdAndDesc();
            currentGroupDesc = ql.getGroupDesc();
            boolean filterPassed = true;
            StringBuffer rowOut = new StringBuffer();
            rowOut.append("<tr class=\"" + ((rowNum % 2 == 0) ? "gOddRow" : "gEvenRow") + "\">");
            rowOut.append("<td width=\"3%\" align=\"center\" class=\"readOnlyCell rowNumberColumn\">" + rowNum + "</td>");
            
            for (int i = 0; i < columns.length; i++)
            {
                // Object value = getProperty(o, columns[i]);
                Object value = getPropertyValue(o, columns[i]);
                if (value == null)
                    value = "";
                // filterMaps[i].put(value.toString(), value);
                if ((itemFilterValue == null || itemFilterValue.trim().length() < 1 || currentItemIdAndDesc
                        .equals(itemFilterValue)))
                {
                    if (storeFilterValue == null || storeFilterValue.trim().length() < 1
                            || currentGroupDesc.equals(storeFilterValue))
                    {
                        // check to see if column is to be displayed or not.
                        String columnName = columns[i];
                        rowOut.append("<td align=\"" + alignment[i] + "\" width=\""+ getColumnWidth(columns[i]) +"\" id=\""+ rowNum + "_"+ i +"\"");
                        if (columnEditable[i])
                        {
                            //rowOut.append(" onclick=\"selectCell(this);\" >");
                            rowOut.append(">");
                            String freezeValue = value.toString();
                            if (freezeValue.equals("true"))
                            {
                                rowOut.append("<select class=\"gList\" name=\"" + columns[i]
                                        + rowNum + "\">");
                                rowOut.append("<option value=\"true\" selected>"
                                        + Utility.getResourceBundleForAllocationGui().getString(
                                                "Label.yes") + "</option>");
                                rowOut.append("<option value=\"false\">"
                                        + Utility.getResourceBundleForAllocationGui().getString(
                                                "Label.no") + "</option>");
                            }
                            else if (freezeValue.equals("false"))
                            {
                                rowOut.append("<select class=\"gList\" name=\"" + columns[i]
                                        + rowNum + "\">");
                                rowOut.append("<option value=\"true\">"
                                        + Utility.getResourceBundleForAllocationGui().getString(
                                                "Label.yes") + "</option>");
                                rowOut.append("<option value=\"false\" selected>"
                                        + Utility.getResourceBundleForAllocationGui().getString(
                                                "Label.no") + "</option>");
                            }
                            else
                            {
                                rowOut
                                        .append("<input class=\"htmlgrid-input\" size=\"7\" maxlength=\"8\" type=\"text\" value=\""
                                                + value + "\" name=\"" + columns[i] + rowNum
                                                // + "\"");
                                                + "\" onChange=\"calculateTotal(this);javascript:editAction(this);\" "
                                                + " onfocus=\"selectCell(this);\""
                                                + "  onkeydown=\"navigate(event, this, $(this).parent());\" ");
                                if (columnDisable[i])
                                {
                                    rowOut.append(" class=\"gDisabledList\" disabled");
                                }
                                else
                                {
                                    rowOut.append(" class=\"gList\"");
                                }
                                rowOut.append(" onblur=\"deselectCell(this);");
                                if (referer.indexOf("quantity_limits") > -1)
                                {
                                    if ((columnName.equalsIgnoreCase("displayTrend"))
                                            || (columnName.equalsIgnoreCase("aggTrend")))
                                    {
                                        rowOut
                                                .append(" window.parent.validateTrend(this);");
                                    }
                                    else
                                    {
                                        rowOut
                                                .append(" if(window.parent.validateForNumbersGreaterThanZero(this)){ window.parent.checkMinMax(this);}");
                                    }
                                }
                                rowOut.append("\">");
                            }

                        }
                        else
                        {
                            rowOut.append(" class=\"readOnlyCell\" >");
                            rowOut.append(value.toString());
                        }
                        rowOut.append("</td>");
                    }
                }
            }
            rowOut.append("</tr>\n");
            primaryKeys.append((primaryKeys.length() > 0 ? "," : "")
            // + getProperty(o, primaryKeyColumn).toString());
                    + getPropertyValue(o, primaryKeyColumn).toString());
            out.append(rowOut);
            rowNum++;
        }
        if (rowNum == 0)
        {
            out.append("<tr class=\"gContentSection\"><td colspan=\""
                    + columns.length
                    + "\" align=\"center\"><b>"
                    + Utility.getResourceBundleForAllocationGui().getString(
                            "Label.no_records_found") + "</b></td></tr>\n");
        }
        out.append("</table>\n </div>\n");
        if (isAnyColumnEditable)
        {
            headerOut.append("<input type=\"hidden\" name=\"primaryKeys\" value=\""
                    + primaryKeys.toString() + "\">\n");
        }

        // String filterOut = generateFilters(filters, newOrderColumnHeadings, newOrderColumnFilter,
        // newOrderColumns, filterMaps);
        StringBuffer filterOut = new StringBuffer();
        if (isAnyColumnFiltered())
        {
            // Generate dynamic filters
            filterOut.append("<thead class=\"fixedHeader\">");
            filterOut.append("<tr class=\"gTableHeader\">");
            filterOut.append("<th width=\"3%\" align=\"center\"> &nbsp; </th>");
            for (int i = 0; i < newOrderColumnHeadings.length; i++)
            {
                filterOut.append("<th  width=\""+ getColumnWidth(newOrderColumns[i]) +"\" align=\"" + alignment[i] + "\">");
                if (newOrderColumnFilter[i])
                {
                    String onChange = "javascript:onClickNavigate(0);";

                    filterOut.append("<select class=\"gList\" name=\"FILTER_" + newOrderColumns[i]+ "\" onChange=\"" + onChange + "\">");
                    filterOut.append("<option value=\"\">" + Utility.getResourceBundleForAllocationGui().getString("Dropdown.all")+ "</option>");
                    Iterator mapIter = filterMaps[i].values().iterator();
                    while (mapIter.hasNext())
                    {
                        String value = (String) mapIter.next();
                        String optionValue = Utility.getUTF8EncodedValue(value);
                        filterOut.append("<option value=\"" + optionValue + "\" "
                                + (value.equals(filters[i]) ? "SELECTED" : "") + ">" + value
                                + "</option>");
                    }
                    filterOut.append("</select>");
                }
                else
                {
                    filterOut.append("<input class=\"filter filter-min\" size=\"1\" maxlength=\"6\" value=\"\" > - <input class=\"filter filter-max\" size=\"1\" maxlength=\"10\" value=\"\" >");
                }
                filterOut.append("</th>");
            }
            filterOut.append("</tr>\n");
            filterOut.append("</thead>");
            filterOut.append("</table>");
        }
        StringBuffer pagingOut = new StringBuffer();
        pagingOut.append("<div class=\"htmlgrid-paging-table\">"); 
        pagingOut.append(generatePaging(sortedLocationsToInclude, firstItemToInclude));
        pagingOut.append("</div>");

        return headerOut.toString() + filterOut + out.toString() + footerOut.toString() +  pagingOut.toString();
    }

    private String getColumnWidth(String columnName)
    {
        String value = null;
        if ("itemIdAndDesc".equals(columnName))
        {
            value = "29%";
        }
        else if ("locationIdAndDesc".equals(columnName))
        {
            value = "13%";
        }
        else if ("groupDesc".equals(columnName))
        {
            value = "13%";
        }
        else if ("deptIdAndDesc".equals(columnName))
        {
            value = "13%";
        }
        else if ("displayMin".equals(columnName))
        {
            value = "7%";
        }
        else if ("displayMax".equals(columnName))
        {
            value = "7%";
        }
        else if ("displayThreshold".equals(columnName))
        {
            value = "7%";
        }
        else if ("displayTrend".equals(columnName))
        {
            value = "7%";
        }
        else if ("displayWos".equals(columnName))
        {
            value = "7%";
        }
        else if ("displayMinNeed".equals(columnName))
        {
            value = "7%";
        }
        else if ("itemIdAndLocationId".equals(columnName))
        {
            value = "13%";
        }
        else
        {
            value = "7%";
        }

        return value;
    }

    private Object getPropertyValue(Object objectInList, String columnName)
    {

        QuantityLimits qtyLimit = (QuantityLimits) objectInList;

        Object value = null;
        if ("itemIdAndDesc".equals(columnName))
        {
            value = qtyLimit.getItemIdAndDesc();
        }
        else if ("locationIdAndDesc".equals(columnName))
        {
            value = qtyLimit.getLocationIdAndDesc();
        }
        else if ("groupDesc".equals(columnName))
        {
            value = qtyLimit.getGroupDesc();
        }
        else if ("deptIdAndDesc".equals(columnName))
        {
            value = qtyLimit.getDeptIdAndDesc();
        }
        else if ("displayMin".equals(columnName))
        {
            value = qtyLimit.getDisplayMin();
        }
        else if ("displayMax".equals(columnName))
        {
            value = qtyLimit.getDisplayMax();
        }
        else if ("displayThreshold".equals(columnName))
        {
            value = qtyLimit.getDisplayThreshold();
        }
        else if ("displayTrend".equals(columnName))
        {
            value = qtyLimit.getDisplayTrend();
        }
        else if ("displayWos".equals(columnName))
        {
            value = qtyLimit.getDisplayWos();
        }
        else if ("displayMinNeed".equals(columnName))
        {
            value = qtyLimit.getDisplayMinNeed();
        }
        else if ("itemIdAndLocationId".equals(columnName))
        {
            value = qtyLimit.getItemIdAndLocationId();
        }
        else
        {
            value = super.getProperty(qtyLimit, columnName);
        }

        if (value == null)
        {
            value = "";
        }

        return value;
    }

    protected String getRecordsPerPageParameterName()
    {

        return "quantity_limits_page_size";
    }
}
