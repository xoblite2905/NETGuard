#!/bin/bash

# Helper: updates or adds a variable in .env
update_env_var() {
  local var_name=$1
  local var_value=$2
  if ! grep -q "^${var_name}=" .env; then
    echo "${var_name}=${var_value}" >> .env
  else
    sed -i "/^${var_name}=/c\\${var_name}=${var_value}" .env
  fi
}
