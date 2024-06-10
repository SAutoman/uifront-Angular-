export const BeckerNewRawDataTemplate = `@model WFM.ConfigurationsAndModels.DTOs.DynamicEntities.DynamicEntityDto
<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">

<head>
  <link rel="stylesheet" type="text/css" href="css/app.css">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width">
  <meta charset="utf-8"/>
  <title>GDC notifications</title>
  <!-- <style> -->
</head>

<body>
  <span class="preheader"></span>
  <table class="body">
    <tr>
      <td class="center" align="center" valign="top">
        <center>

          <table align="center" class="spacer float-center">
            <tbody>
              <tr>
                <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
              </tr>
            </tbody>
          </table>
          <table align="center" class="row float-center">
            <tbody>
              <tr>
                <center>
                @{
                    var logoField = @Model.GetField("logo");
                    var logo = ((WFM.ConfigurationsAndModels.DTOs.Fields.IFieldValue)logoField).GetValue();
                    }
                    <a href=href style="width: 140px; display: block" align="center" class="float-center">
                        <img src="data:image/png;base64,@logo" alt=alt style="width: 140px; height: auto" />
                    </a>
                </center>
              </tr>
            </tbody>
          </table>

          <table align="center" class="spacer float-center">
            <tbody>
              <tr>
                <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
              </tr>
            </tbody>
          </table>

          <table align="center" class="container float-center">
            <tbody>
              <tr>
                <td>
                  <table class="spacer">
                    <tbody>
                      <tr>
                        <td height="24" style="font-size:24px;line-height:24px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="row">
                    <tbody>
                      <tr>
                        <th class="small-12 large-12 columns first last">
                          <table>
                            <tbody>
                              <tr>
                                <th>
                                  <p class="lead">Dear Sir or Madam,</p>
                                  <table class="spacer">
                                    <tbody>
                                      <tr>
                                        <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <p style="line-height: 1.5">
                                    you have new articles in your Cargoclix Workflow Management to prepare EUTR
                                    Documentation for. Please login to your Cargoclix account
                                    and process the new articles within 5 working days.
https://wfm.cargoclix.com/

                                  </p>

                                  <table class="spacer">
                                    <tbody>
                                      <tr>
                                        <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  @{
                                  var items = @Model.GetField("items");
                                  foreach(var item in ((WFM.ConfigurationsAndModels.DTOs.Fields.IFieldValue)items).GetValues())
                                  {
                                  var articleNumber =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("articleNumber")?.ToText();
                                  var articleName =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("articleName")?.ToText();
                                  var orderNumber =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("orderNumber")?.ToText();
                                  var supplierNumber =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("supplierNumber")?.ToText();
                                  var supplierName =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("supplierName")?.ToText();
                                  var buyer =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("buyer")?.ToText();
                                  var etd =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("etd")?.ToText();
                                  var eta =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("eta")?.ToText();
                                  var quantity =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("quantity")?.ToText();
                                  var quantityUnit =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("quantityUnit")?.ToText();
                                  var placeOfUnloading =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("placeOfUnloading")?.ToText();
                                  var port =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("port")?.ToText();
                                  var plant =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("plant")?.ToText();
                                  var shippingMode =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("shippingMode")?.ToText();
                                  var positionNumber =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("positionNumber")?.ToText();
                                  var supplierEmail =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("supplierEmail")?.ToText();   
                                  var shippingPoint =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("shippingPoint")?.ToText();   
                                  var customsStorage =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("customsStorage")?.ToText();   
                                  var location =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("location")?.ToText();   
                                  var bulkItem =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("bulkItem")?.ToText();       
                                  var buyerEmail =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("buyerEmail")?.ToText();  
                                  var orderDate =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("orderDate")?.ToText();  
                                  var orderId =
                                  ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("orderId")?.ToText();
                                  var createdAt = ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).CreatedAt.ToShortDateString();
                                  var updatedAt = ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).UpdatedAt.ToShortDateString();           
                                  @:
                                  <span>
                                    <table class="row">
                                      <tbody>
                                        <tr>
                                          <th class="small-6 large-4 columns first"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Article Number
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(articleNumber)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Article Name
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(articleName)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Order Number
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(orderNumber)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Supplier Number
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(supplierNumber)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Supplier Name
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(supplierName)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Buyer
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(buyer)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      ETD
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(etd)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      ETA
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(eta)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Quantity
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(quantity)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Quantity Unit
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(quantityUnit)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Place Of Unloading
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(placeOfUnloading)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Port
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(port)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>              
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Shipping Mode
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(shippingMode)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Quantity Unit
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(quantityUnit)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Position Number
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(positionNumber)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Supplier Email
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(supplierEmail)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Shipping Point
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(shippingPoint)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Customs Storage
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(customsStorage)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Location
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(location)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Bulk Item
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(bulkItem)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Buyer Email
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(buyerEmail)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Order Date
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(orderDate)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns last"
                                            style="background-color: #f7f7f9; padding-bottom: 0">
                                            <table>
                                              <tbody>
                                                <tr>
                                                  <th>
                                                    <p
                                                      style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                      Order Id
                                                    </p>
                                                    <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                      @(orderId)</p>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th class="small-6 large-4 columns first" style="background-color: #f7f7f9; padding-bottom: 0">
                                          <table>
                                              <tbody>
                                                  <tr>
                                                      <th>
                                                          <p style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                              Created At
                                                          </p>
                                                          <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">@(createdAt)</p>
                                                      </th>
                                                  </tr>
                                              </tbody>
                                          </table>
                                      </th>
                                      <th class="small-6 large-4 columns first" style="background-color: #f7f7f9; padding-bottom: 0">
                                      <table>
                                          <tbody>
                                              <tr>
                                                  <th>
                                                      <p style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                          Updated At
                                                      </p>
                                                      <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">@(updatedAt)</p>
                                                  </th>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </th>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table class="spacer">
                                      <tbody>
                                        <tr>
                                          <td height="8" style="font-size:8px;line-height:8px;">&nbsp;</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </span>

                                  }
                                  }

                                  <table class="spacer">
                                    <tbody>
                                      <tr>
                                        <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table>

                                  <p>For any questions, please contact eutr@g-d-c.eu</p>
                                  <p>Kind Regards,</p>
                                  <p class="lead">EUTR Team of GDC</p>

                                  <table class="spacer">
                                    <tbody>
                                      <tr>
                                        <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </th>
                              </tr>
                            </tbody>
                          </table>
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
          <table align="center" class="spacer float-center">
            <tbody>
              <tr>
                <td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td>
              </tr>
            </tbody>
          </table>

        </center>
      </td>
    </tr>
  </table>
  <!-- prevent Gmail on iOS font size manipulation -->
  <div style="display: none; white-space: nowrap; font: 15px courier; line-height: 0">
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
    &nbsp; &nbsp; &nbsp;
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
  </div>
</body>

</html>
`;
