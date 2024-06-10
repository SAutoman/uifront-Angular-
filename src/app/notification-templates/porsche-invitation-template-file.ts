export const PorscheInvitationsTemplate = `@model WFM.Services.Services.InvitationModel
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
    <link rel="stylesheet" type="text/css" href="css/app.css" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta charset="utf-8"/>
    <title>GDC notifications</title>
    <!-- <style> -->
        <style>
            * {
                font-family: Arial, Helvetica, sans-serif;
                font-weight: 400 !important;
            }
        </style>
</head>
<body>
    <span class="preheader"></span>
    <table class="body">
        <tr>
            <td class="center" align="center" valign="top">
                <center>

                    <table align="center" class="spacer float-center"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>
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

                    <table align="center" class="spacer float-center"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>

                    <table align="center" class="container float-center">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="spacer"><tbody><tr><td height="24" style="font-size:24px;line-height:24px;">&nbsp;</td></tr></tbody></table>

                                    <table class="row">
                                        <tbody>
                                            <tr>
                                                <th class="small-12 large-12 columns first last">
                                                    <table>
                                                        <tbody>
                                                            <tr>
                                                                <th>
																
																<p class="lead" style="text-align: left;">Subject: Invitation to the EUTR online system of Gries Deco Company </p>
                                                                    <table class="spacer"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>
																
                                                                    <p class="lead" style="text-align: left;">Dear Sir or Madam,</p>
                                                                    <table class="spacer"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>
                                                                    <p style="line-height: 1.5; text-align: left;">
                                                                        You are invited to join the EUTR online system of Gries Deco Company (Cargoclix Workflow Management).
                                                                    </p>
																	<p style="text-align: left;">
																	In the system you will be able to upload all relevant EUTR documentation in order to comply with the European Timber Regulation.
																	</p>

                                                                    <table class="spacer"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>

                                                                    <p style="line-height: 1.5; text-align: left;" >																		
																		Please click <a href="@Model.Link">here</a> for registration. If click does not works, please copy and paste the below link in browser: @Model.Link .
                                                                    </p>

                                                                    <table class="spacer"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>

                                                                    </p>

                                                                    <p style="text-align: left;">Please contact EUTR@g-d-c.eu if you did not receive the EUTR guidelines.</p>
                                                                    <p style="text-align: left;">Thank you and kind regards</p>
                                                                    <p class="lead" style="text-align: left;">EUTR Team of GDC</p>

                                                                    <table class="spacer"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>
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
                    <table align="center" class="spacer float-center"><tbody><tr><td height="16" style="font-size:16px;line-height:16px;">&nbsp;</td></tr></tbody></table>

                </center>
            </td>
        </tr>
    </table>
    <!-- prevent Gmail on iOS font size manipulation -->
    <div style="display: none; white-space: nowrap; font: 15px courier; line-height: 0">
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
    </div>
</body>
</html>`;
