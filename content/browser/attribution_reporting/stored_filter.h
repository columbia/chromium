// Copyright 2022 The Chromium Authors
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef CONTENT_BROWSER_ATTRIBUTION_REPORTING_STORED_FILTER_H_
#define CONTENT_BROWSER_ATTRIBUTION_REPORTING_STORED_FILTER_H_

#include <stdint.h>

#include <optional>
#include <vector>

#include "base/time/time.h"
#include "base/types/strong_alias.h"
#include "components/attribution_reporting/aggregation_keys.h"
#include "components/attribution_reporting/event_level_epsilon.h"
#include "components/attribution_reporting/filters.h"
#include "components/attribution_reporting/max_event_level_reports.h"
#include "components/attribution_reporting/trigger_config.h"
#include "components/attribution_reporting/trigger_data_matching.mojom-forward.h"
#include "content/browser/attribution_reporting/common_source_info.h"
#include "content/common/content_export.h"

namespace content {

// Contains attributes specific to a stored source.
class CONTENT_EXPORT StoredFilter {
 public:
  using Id = base::StrongAlias<StoredFilter, int64_t>;

  static std::optional<StoredFilter> Create(
    uint64_t id,
    uint64_t time,
    uint64_t epoch,
    double consumed_budget,
    double initial_budget,
    url::Origin destination_origin,
    url::Origin source_origin,
    uint64_t source_time);

  ~StoredFilter();

  StoredFilter(const StoredFilter&);
  StoredFilter(StoredFilter&&);

  StoredFilter& operator=(const StoredFilter&);
  StoredFilter& operator=(StoredFilter&&);

  uint64_t id() const { return id_; }
  uint64_t time() const { return time_; }
  uint64_t epoch() const { return epoch_; }
  double consumed_budget() const { return consumed_budget_; }
  double initial_budget() const { return initial_budget_; }
  const url::Origin destination_origin() const { return destination_origin_; }
  const url::Origin source_origin() const { return source_origin_; }
  uint64_t source_time() const { return source_time_; }

 private:
    StoredFilter(uint64_t id,
                 uint64_t time,
                 uint64_t epoch,
                 double consumed_budget,
                 double initial_budget,
                 url::Origin destination_origin,
                 url::Origin source_origin,
                 uint64_t source_time);
    
    uint64_t id_;
    uint64_t time_;
    uint64_t epoch_;
    double consumed_budget_;
    double initial_budget_;
    url::Origin destination_origin_;
    url::Origin source_origin_;
    uint64_t source_time_;
    
    // When adding new members, the corresponding `operator==()` definition in
    // `attribution_test_utils.h` should also be updated.   
 };

}  // namespace content

#endif  // CONTENT_BROWSER_ATTRIBUTION_REPORTING_STORED_SOURCE_H_