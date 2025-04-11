import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormatTimePipe} from "./formattime.pipe";
import {CountAgentsPipe} from "./countagents.pipe";
import {CountQueuesPipe} from "./countqueues.pipe";
import {FilterAgentsPipe} from "./filteragents.pipe";
import {FormatCellPipe} from "./formatcell.pipe";
import {FormatHeaderPipe} from "./formatheader.pipe";
import {LimitTextSizePipe} from "./limitTextSize.pipe";
import {FilterExtensionsPipe} from "./filterextensions.pipe";
import {FilterRingGroupsPipe} from "./filterringgroups.pipe";
import {FilterContactPipe} from "./filtercontact.pipe";
import {CountExtensionsPipe} from "./countextensions.pipe";
import {AvailableAgentsPipe} from "./availableagents.pipe";
import {TimeFromTimestampPipe} from "./timeFromTimestamp.pipe";
import {FilterChatsPipe} from "./filter-chats.pipe";
import {MessageFormattingPipe} from "./message-formatting.pipe";
import {WeekDayNumberToTextPipe} from "./weekDayNumberToText.pipe";
import {AllAgentsPipe} from "./allagents.pipe";
import {FilterQueueItemsPipePipe} from "./filter-queue-chats.pipe";
import {IdsToObjectsPipe} from "./ids-to-objects.pipe";
import {FilterReasonsPipe} from "./filterreasons.pipe";
import {FilterChatsSimplePipe} from "./filter-chats-simple.pipe";
import {OrderAgentsPipe} from "./orderagents.pipe";
import {OrderChatsPipe} from "./orderchats.pipe";
import {FilterPanelChatsPipe} from "./filterpanelchats.pipe";
import {FilterShareItemsPipe} from "./filtershareitems.pipe";
import {FilterTasksPipe} from "./filtertasks.pipe";
import {FilterStageOpportunitiesPipe} from "./filter-stage-opportunities.pipe";
import {FilterSystemMessagesPipe} from "./filter-system-messages.pipe";
import {CountTasksPipe} from "./count-tasks.pipe";
import {FilterTasksAgentDashboardPipe} from "./filter-tasks-agent-dashboard.pipe";
import {CountChatsPipe} from "./countchats.pipe";
import {OrderInternalChatsPipe} from "./order-internal-chats.pipe";
import {CountUnreadMessagesPipe} from "./count-unread-messages.pipe";
import {CountInstancesPipe} from "./count-instances.pipe";
import {CountAgentsTypesPipe} from "./count-agents-types.pipe";
import {TemplateMessageFormattingPipe} from "./template-message-formatting.pipe";
import {FilterIvrWidgetsPipe} from "./filter-ivr-widgets.pipe";


@NgModule({
  imports: [CommonModule],
  exports: [FormatTimePipe, CountAgentsPipe, CountQueuesPipe, FilterAgentsPipe, FormatCellPipe, FormatHeaderPipe,
    LimitTextSizePipe, FilterExtensionsPipe, FilterRingGroupsPipe, FilterContactPipe, CountExtensionsPipe, AvailableAgentsPipe,
    TimeFromTimestampPipe, FilterChatsPipe, MessageFormattingPipe, WeekDayNumberToTextPipe, AllAgentsPipe, FilterQueueItemsPipePipe,
    IdsToObjectsPipe, FilterReasonsPipe, FilterChatsSimplePipe, OrderAgentsPipe, OrderChatsPipe, FilterPanelChatsPipe,
    FilterShareItemsPipe, FilterTasksPipe, FilterStageOpportunitiesPipe, FilterSystemMessagesPipe,
    CountTasksPipe, FilterTasksAgentDashboardPipe, CountChatsPipe, OrderInternalChatsPipe, CountUnreadMessagesPipe,
    CountInstancesPipe, CountAgentsTypesPipe, TemplateMessageFormattingPipe, FilterIvrWidgetsPipe],
  declarations: [FormatTimePipe, CountAgentsPipe, CountQueuesPipe, FilterAgentsPipe, FormatCellPipe, FormatHeaderPipe,
    LimitTextSizePipe, FilterExtensionsPipe, FilterRingGroupsPipe, FilterContactPipe, CountExtensionsPipe, AvailableAgentsPipe,
    TimeFromTimestampPipe, FilterChatsPipe, MessageFormattingPipe, WeekDayNumberToTextPipe, AllAgentsPipe, FilterQueueItemsPipePipe,
    IdsToObjectsPipe, FilterReasonsPipe, FilterChatsSimplePipe, OrderAgentsPipe, OrderChatsPipe, FilterPanelChatsPipe,
    FilterShareItemsPipe, FilterTasksPipe, FilterStageOpportunitiesPipe, FilterSystemMessagesPipe,
    CountTasksPipe, FilterTasksAgentDashboardPipe, CountChatsPipe, OrderInternalChatsPipe, CountUnreadMessagesPipe,
    CountInstancesPipe, CountAgentsTypesPipe, TemplateMessageFormattingPipe, FilterIvrWidgetsPipe]
})
export class PipesModule {
}
