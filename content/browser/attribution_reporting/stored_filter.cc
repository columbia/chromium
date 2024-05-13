// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include "content/browser/attribution_reporting/stored_filter.h"

#include <stdint.h>

#include <optional>
#include <utility>

#include "base/check.h"
#include "base/check_op.h"
#include "base/time/time.h"
#include "components/attribution_reporting/aggregation_keys.h"
#include "components/attribution_reporting/constants.h"
#include "components/attribution_reporting/destination_set.h"
#include "components/attribution_reporting/event_level_epsilon.h"
#include "components/attribution_reporting/filters.h"
#include "components/attribution_reporting/max_event_level_reports.h"
#include "components/attribution_reporting/trigger_config.h"
#include "components/attribution_reporting/trigger_data_matching.mojom-forward.h"
#include "content/browser/attribution_reporting/common_source_info.h"

namespace content {
// static
std::optional<StoredFilter> StoredFilter::Create(
    uint64_t id,
    uint64_t time,
    uint64_t epoch,
    double consumed_budget,
    double initial_budget,
    url::Origin destination_origin,
    url::Origin source_origin,
    uint64_t source_time) {
  return StoredFilter(id, time, epoch, consumed_budget, initial_budget, destination_origin, source_origin, source_time);
}

StoredFilter::StoredFilter(
    uint64_t id,
    uint64_t time,
    uint64_t epoch,
    double consumed_budget,
    double initial_budget,
    url::Origin destination_origin,
    url::Origin source_origin,
    uint64_t source_time)
    : id_(id),
      time_(time),
      epoch_(epoch),
      consumed_budget_(consumed_budget),
      initial_budget_(initial_budget),
      destination_origin_(destination_origin),
      source_origin_(source_origin),
      source_time_(source_time) {
  DCHECK(true);
}

StoredFilter::~StoredFilter() = default;

StoredFilter::StoredFilter(const StoredFilter&) = default;

StoredFilter::StoredFilter(StoredFilter&&) = default;

StoredFilter& StoredFilter::operator=(const StoredFilter&) = default;

StoredFilter& StoredFilter::operator=(StoredFilter&&) = default;

}  // namespace content