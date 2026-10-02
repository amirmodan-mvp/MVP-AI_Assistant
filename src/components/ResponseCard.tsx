import type { ResponseCardType, TaskDue } from '@/types/assistant';
import {
  ArrowRight, CalendarDays, Check, CheckCircle2, FileText,
  ListTodo, Sparkles, WandSparkles,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/theme';

type Props = {
  type: ResponseCardType;
  taskTitle?: string;
  taskDue?: TaskDue;
  taskTime?: string;
  checkedList: string[];
  setCheckedList: (items: string[]) => void;
  onAddTask: (title: string, due?: TaskDue, time?: string) => void;
  onOpenTasks: () => void;
  onToast: (text: string) => void;
};

export function ResponseCard(props: Props) {
  const { type } = props;

  if (type === 'task') {
    return (
      <Card>
        <Label icon={<CheckCircle2 size={17} color={Colors.purple} />} text="TASK CREATED" />
        <Text style={styles.heading}>{props.taskTitle}</Text>
        <Text style={styles.meta}>
          <CalendarDays size={15} color="#8E8696" /> {props.taskDue} · {props.taskTime}
        </Text>
        <Action label="View in tasks" onPress={props.onOpenTasks} />
      </Card>
    );
  }

  if (type === 'plan') {
    const items = [
      ['9:00', 'Deep work', 'Finish client proposal'],
      ['11:00', 'Product sync', 'Team meeting'],
      ['12:30', 'Take a break', 'Lunch & recharge'],
      ['2:30', 'Review landing page', 'Focused work'],
    ];
    return (
      <Card>
        <Label icon={<Sparkles size={17} color={Colors.purple} />} text="YOUR PLAN FOR TODAY" />
        <View style={styles.timeline}>
          {items.map(([time, title, detail]) => (
            <View style={styles.timelineRow} key={time}>
              <Text style={styles.time}>{time}</Text>
              <View style={styles.timelineContent}>
                <View style={styles.timelineDot} />
                <Text style={styles.timelineTitle}>{title}</Text>
                <Text style={styles.timelineDetail}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <Action label="Save this plan" onPress={() => props.onToast('Plan saved for today')} />
      </Card>
    );
  }

  if (type === 'list') {
    const items = ['Define the next step', 'Gather what you need', 'Block out some time', 'Get started', 'Review and wrap up'];
    return (
      <Card>
        <Label icon={<ListTodo size={17} color={Colors.purple} />} text="YOUR CHECKLIST" />
        <Text style={styles.heading}>Make it happen</Text>
        <View style={styles.checklist}>
          {items.map(item => {
            const checked = props.checkedList.includes(item);
            return (
              <Pressable
                key={item}
                style={styles.checkRow}
                onPress={() => props.setCheckedList(checked ? props.checkedList.filter(v => v !== item) : [...props.checkedList, item])}
              >
                <View style={[styles.checkbox, checked && styles.checkboxDone]}>
                  {checked ? <Check size={12} color="#FFF" /> : null}
                </View>
                <Text style={[styles.checkText, checked && styles.struck]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
        <Action
          label="Add to tasks"
          onPress={() => {
            items.forEach(item => props.onAddTask(item));
            props.onToast('Checklist added to tasks');
          }}
        />
      </Card>
    );
  }

  if (type === 'decision') {
    return (
      <Card>
        <Label icon={<WandSparkles size={17} color={Colors.purple} />} text="DECISION FRAMEWORK" />
        <Text style={styles.heading}>What matters most?</Text>
        {[
          ['CONSIDER', 'OPTION A', 'OPTION B'],
          ['Cost', 'Lower', 'Higher'],
          ['Long-term value', 'Good', 'Better'],
        ].map((row, i) => (
          <View style={styles.compareRow} key={row[0]}>
            {row.map(cell => <Text key={cell} style={i === 0 ? styles.compareHeader : styles.compareCell}>{cell}</Text>)}
          </View>
        ))}
        <Text style={styles.note}>Choose based on what you'll use most, not just what has the most features.</Text>
        <Action label="Save this comparison" onPress={() => props.onToast('Decision saved for later')} />
      </Card>
    );
  }

  if (type === 'note') {
    return (
      <Card>
        <Label icon={<FileText size={17} color={Colors.purple} />} text="NOTE SUMMARY · EXAMPLE" />
        <Text style={styles.heading}>Product launch meeting</Text>
        <Text style={styles.note}>The team is targeting an October launch. The website and API are the two main workstreams.</Text>
        <View style={styles.summary}>
          <Text style={styles.summaryHeading}>Action items</Text>
          <Text style={styles.summaryText}>Sarah — handle the website</Text>
          <Text style={styles.summaryText}>John — finish the API</Text>
        </View>
        <Action label="Create task from note" onPress={() => { props.onAddTask('Finish the API'); props.onOpenTasks(); }} />
      </Card>
    );
  }

  return (
    <Card>
      <Label icon={<CalendarDays size={17} color={Colors.purple} />} text="COMING UP TOMORROW" />
      {['9:00 AM  Team meeting', '11:30 AM  Client call', '2:00 PM  Dentist'].map(row => (
        <Text style={styles.scheduleRow} key={row}>{row}</Text>
      ))}
      <Action label="Save schedule" onPress={() => props.onToast('Schedule saved')} />
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <View style={styles.label}>{icon}<Text style={styles.labelText}>{text}</Text></View>;
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.action} onPress={onPress}>
      <Text style={styles.actionText}>{label}</Text>
      <ArrowRight size={15} color={Colors.purple} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 12, borderRadius: 15, borderWidth: 1, borderColor: '#E9E2EE', backgroundColor: '#FFF', padding: 16 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  labelText: { color: '#8863BD', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  heading: { fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 8, color: '#393341' },
  meta: { flexDirection: 'row', alignItems: 'center', color: '#8E8696', fontSize: 10 },
  action: { borderTopWidth: 1, borderTopColor: '#F0ECF1', marginTop: 14, paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionText: { color: Colors.purple, fontSize: 11, fontWeight: '700' },
  timeline: { marginTop: 14 },
  timelineRow: { flexDirection: 'row', minHeight: 45 },
  time: { width: 45, color: '#927DB2', fontSize: 10, fontWeight: '700' },
  timelineContent: { flex: 1, paddingLeft: 16, position: 'relative' },
  timelineDot: { position: 'absolute', left: 0, top: 3, width: 7, height: 7, borderRadius: 4, backgroundColor: '#A78BCE' },
  timelineTitle: { fontSize: 11, fontWeight: '700' },
  timelineDetail: { color: '#AAA2AF', fontSize: 10, marginTop: 2 },
  checklist: { gap: 11, marginVertical: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 17, height: 17, borderWidth: 1, borderColor: '#CDBDDF', borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#8864C1', borderColor: '#8864C1' },
  checkText: { fontSize: 11, color: '#5D5663', flex: 1 },
  struck: { textDecorationLine: 'line-through', color: '#A7A0AA' },
  compareRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0EDF2', paddingVertical: 9, gap: 5 },
  compareHeader: { flex: 1, fontSize: 8, fontWeight: '800', color: '#A189BA' },
  compareCell: { flex: 1, fontSize: 10, color: '#5D5663' },
  note: { color: '#847A8B', fontSize: 10, lineHeight: 16, marginTop: 12 },
  summary: { gap: 5, marginTop: 14 },
  summaryHeading: { fontSize: 10, fontWeight: '700', color: '#453E4D' },
  summaryText: { fontSize: 10, color: '#736A7A' },
  scheduleRow: { borderBottomWidth: 1, borderBottomColor: '#F0EDF2', paddingVertical: 12, fontSize: 11, color: '#514A56' },
});
