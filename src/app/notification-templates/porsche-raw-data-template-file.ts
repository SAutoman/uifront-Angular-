export const PorscheNewRawDataTemplate = `@model WFM.ConfigurationsAndModels.DTOs.DynamicEntities.DynamicEntityDto
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
                                                      var datumUndAnmeldungUhrzeit =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("datumUndAnmeldungUhrzeit")?.ToText();
                                                      var relation =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("relation")?.ToText();
                                                      var kundenNummer =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("kundenNummer")?.ToText();
                                                      var containerNummer =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("containerNummer")?.ToText();
                                                      var rampe =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("rampe")?.ToText();
                                                      var taraGewicht =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("taraGewicht")?.ToText();
                                                      var transportbeleg =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("transportbeleg")?.ToText();
                                                      var siegelNo =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("siegelNo")?.ToText();
                                                      var imo =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("imo")?.ToText();
                                                      var cont =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("cont")?.ToText();
                                                      var type =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("type")?.ToText();
                                                      var niO =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("niO")?.ToText();
                                                      var abzugsterminIst =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("abzugsterminIst")?.ToText();
                                                      var abzugsterminSoll =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("abzugsterminSoll")?.ToText();
                                                      var dlReferenz =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("dlReferenz")?.ToText();
                                                      var schiff =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("schiff")?.ToText();
                                                      var ets =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("ets")?.ToText();
                                                      var eta =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("eta")?.ToText();
                                                      var empfangshafen =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("empfangshafen")?.ToText();
                                                      var anlieferreferenzSeehafen =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("anlieferreferenzSeehafen")?.ToText();
                                                      var anlieferterminalSeehafen =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("anlieferterminalSeehafen")?.ToText();
                                                      var cargoClosingSeehafen =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("cargoClosingSeehafen")?.ToText();
                                                      var bemerkungen =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("bemerkungen")?.ToText();
                                                      var yardIn =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("yardIn")?.ToText();
                                                      var yardOutAnRampe =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("yardOutAnRampe")?.ToText();
                                                      var yardInVonRampe =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("yardInVonRampe")?.ToText();
                                                      var outFinal =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("outFinal")?.ToText();
                                                      var bemerkung =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("bemerkung")?.ToText();
                                                      var abweichungInH =
                                                      ((WFM.ConfigurationsAndModels.DTOs.DynamicEntities.BaseDynamicEntityDto)item).GetField("abweichungInH")?.ToText();
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
                                                                                    @(articleNumber)
                                                                                 </p>
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
                                                                                    @(articleName)
                                                                                 </p>
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
                                                                                    @(orderNumber)
                                                                                 </p>
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
                                                                                    @(supplierNumber)
                                                                                 </p>
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
                                                                                    @(supplierName)
                                                                                 </p>
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
                                                                                    @(buyer)
                                                                                 </p>
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
                                                                                    @(etd)
                                                                                 </p>
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
                                                                                    @(eta)
                                                                                 </p>
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
                                                                                    @(quantity)
                                                                                 </p>
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
                                                                                    @(quantityUnit)
                                                                                 </p>
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
                                                                                    Datum und Anmeldung Uhrzeit
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(datumUndAnmeldungUhrzeit)
                                                                                 </p>
                                                                              </th>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </th>
                                                                  <th class="small-6 large-4 columns last" style="background-color: #f7f7f9; padding-bottom: 0">
                                                                     <table>
                                                                        <tbody>
                                                                           <tr>
                                                                              <th>
                                                                                 <p
                                                                                    style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                                                    Relation
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(relation)
                                                                                 </p>
                                                                              </th>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </th>
                                                                  <th class="small-6 large-4 columns last" style="background-color: #f7f7f9; padding-bottom: 0">
                                                                     <table>
                                                                        <tbody>
                                                                           <tr>
                                                                              <th>
                                                                                 <p
                                                                                    style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                                                    Kunden Nummer
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(kundenNummer)
                                                                                 </p>
                                                                              </th>
                                                                           </tr>
                                                                        </tbody>
                                                                     </table>
                                                                  </th>
                                                                  <th class="small-6 large-4 columns last" style="background-color: #f7f7f9; padding-bottom: 0">
                                                                     <table>
                                                                        <tbody>
                                                                           <tr>
                                                                              <th>
                                                                                 <p
                                                                                    style="margin-left: 8px; margin-right: 8px; margin-top: 8px; font-size: 9px; text-transform: uppercase; opacity: 0.5">
                                                                                    Container Nummer
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(containerNummer)
                                                                                 </p>
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
                                                                                    Rampe
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(rampe)
                                                                                 </p>
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
                                                                                    Tara Gewicht
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(taraGewicht)
                                                                                 </p>
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
                                                                                    Transportbeleg
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(transportbeleg)
                                                                                 </p>
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
                                                                                    Siegel No
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(siegelNo)
                                                                                 </p>
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
                                                                                    IMO
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(imo)
                                                                                 </p>
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
                                                                                    Type
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(type)
                                                                                 </p>
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
                                                                                    Ni O
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(niO)
                                                                                 </p>
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
                                                                                    Abzugstermin Ist
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(abzugsterminIst)
                                                                                 </p>
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
                                                                                    Abzugstermin Soll
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(abzugsterminSoll)
                                                                                 </p>
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
                                                                                    DL Referenz
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(dlReferenz)
                                                                                 </p>
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
                                                                                    Schiff
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(schiff)
                                                                                 </p>
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
                                                                                    ETS
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(ets)
                                                                                 </p>
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
                                                                                    ETA
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(eta)
                                                                                 </p>
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
                                                                                    Empfangshafen
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(empfangshafen)
                                                                                 </p>
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
                                                                                    Anlieferreferenz Seehafen
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(anlieferreferenzSeehafen)
                                                                                 </p>
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
                                                                                    Anlieferterminal Seehafen
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(anlieferterminalSeehafen)
                                                                                 </p>
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
                                                                                    Cargo ClosingSeehafen
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(cargoClosingSeehafen)
                                                                                 </p>
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
                                                                                    Bemerkungen
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(bemerkungen)
                                                                                 </p>
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
                                                                                    Yard In
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(yardIn)
                                                                                 </p>
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
                                                                                    Yard Out An Rampe
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(yardOutAnRampe)
                                                                                 </p>
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
                                                                                    Yard In Von Rampe
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(yardInVonRampe)
                                                                                 </p>
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
                                                                                    Out Final
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(outFinal)
                                                                                 </p>
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
                                                                                    Bemerkung
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(bemerkung)
                                                                                 </p>
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
                                                                                    Abweichung InH
                                                                                 </p>
                                                                                 <p style="margin-bottom: 8px; margin-left: 8px; margin-right: 8px">
                                                                                    @(abweichungInH)
                                                                                 </p>
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
