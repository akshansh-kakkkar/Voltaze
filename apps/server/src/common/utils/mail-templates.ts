import handlebars from "handlebars";

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&family=JetBrains+Mono:wght@500&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #f8fafc;
    color: #0f172a;
  }
  
  .wrapper {
    width: 100%;
    table-layout: fixed;
    background-color: #f8fafc;
    padding-top: 40px;
    padding-bottom: 40px;
  }
  
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
  }
  
  .header {
    background-color: #000031;
    padding: 40px;
    text-align: center;
  }
  
  .logo-text {
    color: #ffffff;
    font-weight: 900;
    font-size: 24px;
    letter-spacing: -0.05em;
  }
  
  .content {
    padding: 40px;
  }
  
  .label {
    font-weight: 900;
    font-size: 10px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    margin-bottom: 8px;
    display: block;
  }
  
  .title {
    font-weight: 900;
    font-size: 32px;
    color: #0f172a;
    letter-spacing: -0.025em;
    margin-top: 0;
    margin-bottom: 24px;
    line-height: 1.1;
  }
  
  .description {
    font-size: 16px;
    line-height: 1.6;
    color: #475569;
    margin-bottom: 32px;
  }
  
  .stats-grid {
    border: 1px solid #e2e8f0;
    margin-bottom: 32px;
  }
  
  .stat-row {
    border-bottom: 1px solid #e2e8f0;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-row:last-child {
    border-bottom: none;
  }
  
  .stat-label {
    font-weight: 800;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .stat-value {
    font-weight: 700;
    font-size: 14px;
    color: #0f172a;
    font-family: 'JetBrains Mono', monospace;
  }
  
  .ticket-list {
    margin-top: 32px;
    padding: 0;
    list-style: none;
  }
  
  .ticket-item {
    background-color: #f8fafc;
    border-left: 4px solid #000031;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .button {
    display: inline-block;
    background-color: #000031;
    color: #ffffff !important;
    padding: 18px 36px;
    text-decoration: none;
    font-weight: 900;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    margin-top: 24px;
    transition: all 0.2s;
  }
  
  .footer {
    padding: 40px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    background-color: #ffffff;
  }
  
  .footer-text {
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.6;
  }
`;

const orderConfirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">UniEvent</div>
      </div>
      <div class="content">
        <span class="label">Transaction Protocol</span>
        <h1 class="title">ORDER<br/>CONFIRMED.</h1>
        <p class="description">Hi {{attendeeName}}, your registration for <strong>{{eventName}}</strong> has been finalized. Your digital access keys are now active.</p>
        
        <div class="stats-grid">
          <div class="stat-row">
            <span class="stat-label">Order Reference</span>
            <span class="stat-value">#{{orderId}}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Settlement Amount</span>
            <span class="stat-value">{{amount}}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Execution Time</span>
            <span class="stat-value">{{eventDate}}</span>
          </div>
        </div>

        <span class="label">Access Manifest</span>
        <div class="ticket-list">
          {{#each tickets}}
          <div class="ticket-item">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div class="stat-label" style="font-size: 9px; margin-bottom: 4px;">Tier</div>
                <div class="stat-value" style="font-size: 16px; margin-bottom: 8px;">{{tierName}}</div>
                {{#if attendeeName}}
                <div class="stat-label" style="font-size: 9px; margin-bottom: 4px;">Assigned To</div>
                <div class="stat-value" style="font-size: 12px; font-family: inherit;">{{attendeeName}} ({{attendeeEmail}})</div>
                {{/if}}
              </div>
              <div style="text-align: right;">
                <div class="stat-label" style="font-size: 9px; margin-bottom: 4px;">Access Code</div>
                <div class="stat-value" style="font-size: 12px;">{{passCode}}</div>
              </div>
            </div>
          </div>
          {{/each}}
        </div>

        <a href="{{dashboardUrl}}" class="button">Access Dashboard</a>
      </div>
      <div class="footer">
        <p class="footer-text">
          &copy; {{year}} UniEvent. All rights reserved.<br/>
          This is an automated operational notification.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

const authTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">UniEvent</div>
      </div>
      <div class="content">
        <span class="label">Authentication Protocol</span>
        <h1 class="title">{{title}}</h1>
        <p class="description">{{description}}</p>
        
        <a href="{{link}}" class="button">{{buttonText}}</a>
        
        <p class="description" style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <span style="word-break: break-all; color: #000031; font-family: 'JetBrains Mono', monospace;">{{link}}</span>
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          &copy; {{year}} UniEvent. All rights reserved.<br/>
          If you did not request this, please ignore this email.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const renderOrderEmail = (data: {
	attendeeName: string;
	eventName: string;
	orderId: string;
	amount: string;
	eventDate: string;
	tickets: Array<{
		tierName: string;
		passCode: string;
		attendeeName?: string;
		attendeeEmail?: string;
	}>;
	dashboardUrl: string;
}) => {
	const template = handlebars.compile(orderConfirmationTemplate);
	return template({
		...data,
		year: new Date().getFullYear(),
	});
};

export const renderAuthEmail = (data: {
	title: string;
	description: string;
	buttonText: string;
	link: string;
}) => {
	const template = handlebars.compile(authTemplate);
	return template({
		...data,
		year: new Date().getFullYear(),
	});
};
