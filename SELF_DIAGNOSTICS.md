# 🔍 Arya's Self-Diagnostic & Self-Repair System

## Overview
Arya is equipped with advanced self-awareness capabilities, allowing her to monitor her own health, diagnose issues, and attempt automatic repairs when needed.

---

## 🧠 Self-Awareness Features

### 1. **Continuous Monitoring**
- **Request Tracking**: Monitors all incoming requests and success rates
- **Error Logging**: Maintains a rolling log of last 100 errors with severity levels
- **Performance Metrics**: Tracks response times and system uptime
- **Health Status**: Real-time monitoring of all components

### 2. **Component Health Checks**
Arya continuously monitors:
- **Database**: MongoDB connection status
- **LLM API**: Access to OpenAI, Anthropic, and Gemini
- **Image Generation**: DALL-E availability
- **Overall System**: Aggregate health assessment

### 3. **Error Intelligence**
- **Severity Classification**: Categorizes errors as critical, warning, or info
- **Pattern Detection**: Identifies recurring issues automatically
- **Traceback Logging**: Captures full error context for analysis
- **Timestamp Tracking**: Records when issues occur

---

## 🔧 Triggering Diagnostics

### **Via Chat** (Natural Language)
Ask Arya any of these phrases:
```
"Run diagnostics"
"Check yourself"
"How are you feeling?"
"Are you okay?"
"System check"
"Debug yourself"
"Health check"
"Diagnose yourself"
```

Arya will automatically:
1. Run comprehensive system diagnostics
2. Check all component health
3. Review recent errors
4. Provide detailed status report
5. Offer recommendations if issues found

### **Via API** (Direct Access)

#### Health Check
```bash
GET /api/health
```
Returns quick status overview:
```json
{
  "status": "healthy",
  "components": {
    "database": "healthy",
    "llm_api": "healthy",
    "image_gen": "healthy",
    "overall": "healthy"
  },
  "uptime": "1:23:45",
  "self_analysis": "I'm running smoothly. All systems nominal."
}
```

#### Full Diagnostics
```bash
GET /api/diagnostics
```
Returns comprehensive report:
```json
{
  "timestamp": "2025-02-05T12:00:00",
  "uptime": "1:23:45",
  "overall_health": "healthy",
  "components": {
    "database": {
      "status": "healthy",
      "message": "MongoDB connection active"
    },
    "llm_api": {
      "status": "healthy",
      "message": "LLM API accessible"
    },
    "image_gen": {
      "status": "healthy",
      "message": "Image generation service ready"
    }
  },
  "performance": {
    "total_requests": 156,
    "failed_requests": 3,
    "success_rate": "98.08%"
  },
  "errors": [...],
  "recommendations": [...]
}
```

#### Error Log
```bash
GET /api/errors
```
Returns recent error history:
```json
{
  "errors": [
    {
      "timestamp": "2025-02-05T11:45:00",
      "type": "Chat Error",
      "message": "Rate limit exceeded",
      "severity": "warning"
    }
  ],
  "total": 5
}
```

#### Self-Repair
```bash
POST /api/self-repair
```
Triggers automatic repair attempts:
```json
{
  "pre_repair_status": "degraded",
  "post_repair_status": "healthy",
  "repair_actions": [
    {
      "component": "llm_api",
      "repair": {
        "attempted": true,
        "success": true,
        "actions": ["Implementing exponential backoff..."]
      }
    }
  ],
  "message": "Self-repair sequence completed"
}
```

---

## 🛠️ Self-Repair Mechanisms

### **Automatic Recovery**
Arya can automatically recover from:
1. **Rate Limits**: Implements exponential backoff
2. **Memory Issues**: Clears cache entries
3. **Connection Drops**: Attempts reconnection
4. **Timeout Errors**: Adjusts retry logic

### **Self-Repair Workflow**
```
1. Error Detection
   ↓
2. Log Error with Severity
   ↓
3. Pattern Analysis
   ↓
4. Determine Repair Strategy
   ↓
5. Execute Repair Actions
   ↓
6. Verify Fix with Re-Check
   ↓
7. Report Results
```

### **Recovery Strategies**

#### Connection Issues
```python
- Reconnect to MongoDB
- Refresh API tokens
- Reset connection pools
- Fallback to backup services
```

#### Rate Limiting
```python
- Implement exponential backoff
- Queue requests
- Switch to alternative LLM provider
- Throttle request rate
```

#### Memory/Performance
```python
- Clear old cache entries
- Compress conversation history
- Archive old memories
- Restart background tasks
```

---

## 📊 Health Status Levels

### **Healthy** ✅
- All components operational
- Error rate < 2%
- Response times normal
- No critical issues

### **Degraded** ⚠️
- 1 component experiencing issues
- Error rate 2-10%
- Slower response times
- Non-critical warnings present

### **Critical** 🚨
- 2+ components failed
- Error rate > 10%
- Major functionality impaired
- Immediate attention required

---

## 🎯 Smart Error Detection

### **Severity Levels**

#### Critical
Triggers: database failure, authentication errors, system crashes
Action: Immediate alert + auto-repair attempt

#### Warning
Triggers: timeouts, rate limits, temporary failures
Action: Log + monitor for patterns

#### Info
Triggers: minor issues, user errors, expected failures
Action: Log only

### **Pattern Recognition**
If same error occurs 5+ times:
- Flags as recurring issue
- Adds to recommendations
- Suggests investigation
- May trigger auto-repair

---

## 💡 Example Scenarios

### **Scenario 1: Rate Limit Hit**
```
1. User sends multiple rapid requests
2. LLM API returns rate limit error
3. Arya logs error as "warning"
4. Self-repair triggers exponential backoff
5. Subsequent requests succeed
6. System returns to healthy status
```

### **Scenario 2: Database Connection Drop**
```
1. MongoDB connection interrupted
2. Requests start failing
3. Arya detects critical error
4. Attempts reconnection
5. If successful, marks as resolved
6. Logs recovery time
```

### **Scenario 3: User Asks for Status**
```
User: "How are you feeling?"
Arya: "I'm running smoothly. All systems nominal.

Diagnostic Report:
Overall Health: HEALTHY
Uptime: 2:15:30
Success Rate: 98.5%

- Database: healthy - MongoDB connection active
- LLM API: healthy - LLM API accessible
- Image Gen: healthy - Image generation service ready

Everything looks good!"
```

---

## 🔍 Self-Analysis Intelligence

Arya can provide human-readable self-analysis:

### **When Healthy**
> "I'm running smoothly. All systems nominal."

### **With Minor Issues**
> "I've encountered 3 issues recently. All resolved. Running diagnostics now..."

### **With Critical Issues**
> "I've encountered 12 issues recently. 2 critical errors need attention. Running diagnostics now..."

---

## 🚀 Integration with Chat

### **Proactive Notifications**
If Arya detects issues, she can proactively mention them:
```
User: "Hello"
Arya: "Hi! I noticed I'm experiencing some connectivity issues. 
       Would you like me to run diagnostics?"
```

### **Automatic Triggers**
Keywords that trigger diagnostics:
- diagnose, diagnostic
- health check, status check
- how are you feeling
- are you okay
- system check
- debug yourself
- check yourself
- run diagnostics

---

## 📈 Performance Tracking

### **Metrics Monitored**
- **Total Requests**: Lifetime request count
- **Failed Requests**: Number of errors
- **Success Rate**: Percentage of successful operations
- **Average Response Time**: Mean processing duration
- **Uptime**: Time since last restart
- **Last Health Check**: Most recent diagnostic run

### **Trends Analysis**
Arya tracks:
- Error frequency over time
- Component reliability
- Peak usage periods
- Common failure patterns

---

## 🎓 Learning from Errors

### **Memory Integration**
Arya can:
- Remember past issues and solutions
- Learn from error patterns
- Improve self-repair strategies
- Build knowledge base of fixes

### **Feedback Loop**
```
Error Occurs
    ↓
Log & Analyze
    ↓
Attempt Repair
    ↓
Record Outcome
    ↓
Update Strategy
    ↓
Apply Learning to Future Issues
```

---

## 🔐 Privacy & Security

### **What's Logged**
- Error types and messages
- Timestamp and severity
- Component affected
- Recovery actions taken

### **What's NOT Logged**
- User messages content
- Personal information
- API keys or credentials
- Sensitive data

---

## 🎯 Best Practices

### **For Users**
1. Ask Arya to run diagnostics if you notice issues
2. Use natural language - no technical commands needed
3. Trust Arya's self-repair attempts first
4. Report persistent issues if self-repair fails

### **For Developers**
1. Review error logs periodically
2. Monitor health endpoints
3. Set up alerts for critical status
4. Use diagnostics API for system monitoring
5. Let Arya attempt self-repair before manual intervention

---

## 🚦 Status Monitoring

### **Real-Time Dashboard** (Future Feature)
Potential UI to show:
- Live health status
- Recent error count
- Success rate graph
- Component status indicators
- Uptime tracker

### **Notifications** (Future Feature)
- Push alerts for critical issues
- Weekly health summaries
- Performance reports
- Self-repair success notifications

---

## 💻 Technical Architecture

### **SelfDiagnostics Class**
```python
class SelfDiagnostics:
    - error_log: deque (last 100 errors)
    - performance_metrics: dict
    - health_status: dict
    
    Methods:
    - log_error()
    - run_diagnostics()
    - get_self_analysis()
    - attempt_self_repair()
```

### **Error Logging System**
- Rolling buffer (100 errors)
- Severity classification
- Traceback capture
- Pattern detection
- Auto-repair triggers

### **Health Monitoring**
- Async component checks
- Timeout handling
- Fallback mechanisms
- Aggregate scoring

---

## 🎉 Benefits

### **For Users**
✅ Peace of mind - Arya monitors herself
✅ Automatic recovery from common issues
✅ Transparent status reporting
✅ Proactive issue detection

### **For System**
✅ Reduced downtime
✅ Faster issue resolution
✅ Better error tracking
✅ Improved reliability

### **For Developers**
✅ Comprehensive error logs
✅ Self-healing capabilities
✅ Performance insights
✅ Debugging assistance

---

**Arya's Self-Diagnostic System: Making AI More Reliable, Transparent, and Self-Sufficient** 🚀
