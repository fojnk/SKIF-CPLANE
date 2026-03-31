package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var DBTime = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name: "streamflow_cplane_db_time",
	Help: "How long it took to process the SQL query, partitioned by query text and status",
}, []string{"sql", "status"})

var ABCSyncTime = promauto.NewHistogramVec(prometheus.HistogramOpts{
	Name: "streamflow_cplane_abc_sync_time",
	Help: "How long it took to sync the ABC group",
}, []string{"group_name"})

var ABCSyncErrors = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "streamflow_cplane_abc_sync_errors",
	Help: "How many errors occurred while syncing the ABC groups",
}, nil)

var ABCGroupsNum = promauto.NewGaugeVec(prometheus.GaugeOpts{
	Name: "streamflow_cplane_abc_sync_groups_num",
	Help: "How many groups are synced",
}, nil)

var ABCSyncHeartbeat = promauto.NewGaugeVec(prometheus.GaugeOpts{
	Name: "streamflow_cplane_abc_sync_heartbeat",
	Help: "Heartbeat for the ABC sync",
}, nil)

var LogErrors = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "streamflow_cplane_log_errors",
	Help: "How many errors occurred while logging",
}, nil)

var OAuthFails = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "streamflow_cplane_oauth_fails",
	Help: "How many oauth failures, partitioned by error type and status code",
}, []string{"error_type", "operation", "status_code"})

var CacheErrors = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "streamflow_cplane_cache_errors",
	Help: "How many errors occurred in cache",
}, nil)

var CacheRPS = promauto.NewCounterVec(prometheus.CounterOpts{
	Name: "streamflow_cplane_cache_rps",
	Help: "How many requests goes to cache",
}, nil)
